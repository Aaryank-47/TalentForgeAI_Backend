import { Worker, type Job, UnrecoverableError } from "bullmq";
import prisma from "../../../config/database.js";
import { logger } from "../../../common/logger/logger.js";
import env from "../../../config/env.js";
import { redisConnectionConfig } from "../../../common/queue/redis.config.js";
import { OpenRouterError } from "../../../common/integrations/openRouter/errors/openrouter.error.js";
import {
    EmptyDocumentTextError,
    ScannedPdfDetectedError,
    UnsupportedFileTypeError
} from "../errors/document-extraction.errors.js";
import { BadRequestError } from "../../../common/errors/BadRequestError.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ResumeProcessingPipeline } from "../pipelines/resume-processing.pipeline.js";
import {
    RESUME_PROCESSING_QUEUE_NAME,
    type ResumeProcessingJobData,
    type ResumeProcessingJobResult
} from "./resume-processing.types.js";
import type { Prisma } from "@prisma/client";

import { ResumeProgressPublisher } from "../websocket/resume-progress.publisher.js";
import type { StageChangeHandler } from "../interfaces/resume-pipeline.interface.js";
import { ResumeProcessingStateService } from "../services/resume-processing-state.service.js";
import { MatchingEventsPublisher } from "../../matching/events/matching-events.publisher.js";

export class ResumeProcessingWorker {
    
    private worker: Worker<ResumeProcessingJobData, ResumeProcessingJobResult> | null = null;
    private readonly pipeline: ResumeProcessingPipeline;
    private readonly stageChangeHandler: StageChangeHandler;

    constructor(
        pipeline: ResumeProcessingPipeline = new ResumeProcessingPipeline(),
        stageChangeHandler: StageChangeHandler = async (stage, meta) => {
            await ResumeProcessingStateService.setCurrentStage(meta.resumeId, stage, meta.reason);
            await ResumeProgressPublisher.publishStageChange(stage, meta);
        }
    ) {
        this.pipeline = pipeline;
        this.stageChangeHandler = stageChangeHandler;
    }

    // Initializes and starts the BullMQ worker for resume processing.    
    public start(): Worker<ResumeProcessingJobData, ResumeProcessingJobResult> {
        if (this.worker) {
            return this.worker;
        }

        const concurrency = env.queue.resumeWorkerConcurrency;

        logger.info(
            { concurrency, queueName: RESUME_PROCESSING_QUEUE_NAME },
            "[ResumeProcessingWorker] Initializing worker..."
        );

        this.worker = new Worker<ResumeProcessingJobData, ResumeProcessingJobResult>(
            RESUME_PROCESSING_QUEUE_NAME,
            async (job: Job<ResumeProcessingJobData, ResumeProcessingJobResult>) => {
                return this.processJob(job);
            },
            {
                connection: redisConnectionConfig,
                concurrency
            }
        );

        this.attachEventListeners();

        logger.info("[ResumeProcessingWorker] Worker started and listening for jobs.");
        return this.worker;
    }

    
    // Core orchestrator method for processing a single resume job.    
    public async processJob(
        job: Job<ResumeProcessingJobData, ResumeProcessingJobResult>
    ): Promise<ResumeProcessingJobResult> {
        const { candidateId, resumeId } = job.data;
        const jobId = job.id || `job-${resumeId}`;
        const startTime = performance.now();

        logger.info(
            {
                event: "JOB_STARTED",
                jobId,
                resumeId,
                candidateId,
                attempt: job.attemptsMade + 1
            },
            `[ResumeProcessingWorker] Started processing resume "${resumeId}" (Attempt ${job.attemptsMade + 1})`
        );

        try {
            // Guard against duplicate execution if already completed (Idempotency)
            const existingResume = await prisma.resume.findUnique({
                where: { id: resumeId },
                select: {
                    id: true,
                    parsingStatus: true
                }
            });

            if (!existingResume) {
                throw new NotFoundError(`Resume with ID "${resumeId}" does not exist in database`);
            }

            if (existingResume.parsingStatus === "COMPLETED") {
                logger.warn(
                    { jobId, resumeId, candidateId },
                    `[ResumeProcessingWorker] Resume "${resumeId}" is already COMPLETED. Skipping redundant processing.`
                );
                await ResumeProcessingStateService.clearCurrentStage(resumeId);
                return {
                    success: true,
                    resumeId,
                    candidateId,
                    durationMs: Math.round(performance.now() - startTime),
                    skillsCount: 0,
                    experienceCount: 0,
                    educationCount: 0,
                    projectsCount: 0,
                    certificationsCount: 0
                };
            }

            // Mark status as PROCESSING in database (Critical: errors propagate to BullMQ)
            await this.updateResumeStatus(resumeId, "PROCESSING", {
                parsingStartedAt: new Date(),
                parsingError: null
            });
            await ResumeProcessingStateService.setCurrentStage(resumeId, "FETCHING_FILE");

            // Execute the explicit multi-stage processing pipeline
            const { normalizedData, persistenceResult, durationMs } =
                await this.pipeline.execute(job.data, jobId, this.stageChangeHandler);

            // Update database record to COMPLETED (Critical: errors propagate to BullMQ)
            await this.updateResumeStatus(resumeId, "COMPLETED", {
                parsingCompletedAt: new Date(),
                parsingError: null,
                rawParsedData: normalizedData as unknown as Prisma.InputJsonValue
            });

            // CRITICAL INVARIANT: Client receives COMPLETED only AFTER PostgreSQL record is verified COMPLETED
            await ResumeProgressPublisher.publishCompleted({
                jobId,
                resumeId,
                candidateId
            });

            // Clean up ephemeral Redis processing micro-stage on successful completion
            await ResumeProcessingStateService.clearCurrentStage(resumeId);

            // Trigger targeted candidate matching event in background
            try {
                await MatchingEventsPublisher.onCandidateMatchingDataChanged(candidateId, [
                    "RESUME_PARSED",
                    "skills",
                    "experience",
                    "education"
                ]);
            } catch (matchingErr) {
                logger.warn(
                    { err: matchingErr, candidateId, resumeId },
                    "[ResumeProcessingWorker] Non-critical warning: Failed to publish matching event after resume completion."
                );
            }

            const result: ResumeProcessingJobResult = {
                success: true,
                resumeId,
                candidateId,
                durationMs,
                skillsCount: normalizedData.skills.length,
                experienceCount: normalizedData.experience.length,
                educationCount: normalizedData.education.length,
                projectsCount: normalizedData.projects.length,
                certificationsCount: normalizedData.certifications.length
            };

            logger.info(
                {
                    event: "JOB_COMPLETED",
                    jobId,
                    resumeId,
                    candidateId,
                    durationMs,
                    skillsCreated: persistenceResult.skillsCreated,
                    skillsUpdated: persistenceResult.skillsUpdated,
                    experiencesCreated: persistenceResult.experiencesCreated,
                    educationCreated: persistenceResult.educationCreated,
                    projectsCreated: persistenceResult.projectsCreated,
                    certificationsCreated: persistenceResult.certificationsCreated
                },
                `[ResumeProcessingWorker] Resume "${resumeId}" processed and persisted successfully in ${durationMs}ms`
            );

            return result;
        } catch (error: unknown) {
            const durationMs = Math.round(performance.now() - startTime);
            const isPermanent = this.isPermanentError(error);
            const errorMessage = error instanceof Error ? error.message : "Unknown resume processing error";

            logger.error(
                {
                    event: "JOB_FAILED",
                    jobId,
                    resumeId,
                    candidateId,
                    durationMs,
                    isPermanent,
                    attempt: job.attemptsMade + 1,
                    maxAttempts: job.opts?.attempts || env.queue.resumeJobAttempts,
                    err: errorMessage
                },
                `[ResumeProcessingWorker] Processing failed for resume "${resumeId}": ${errorMessage}`
            );

            // If permanent error OR all retry attempts exhausted, update DB status to FAILED and emit final failure
            const isFinalAttempt = (job.attemptsMade + 1) >= (job.opts?.attempts || env.queue.resumeJobAttempts);
            if (isPermanent || isFinalAttempt) {
                let dbFailedUpdateSuccess = false;
                try {
                    await this.updateResumeStatus(resumeId, "FAILED", {
                        parsingCompletedAt: new Date(),
                        parsingError: errorMessage
                    });
                    dbFailedUpdateSuccess = true;
                } catch (dbErr: unknown) {
                    logger.fatal(
                        {
                            event: "RESUME_FAILED_DB_UPDATE_FAILED",
                            err: dbErr,
                            resumeId,
                            candidateId,
                            originalError: errorMessage
                        },
                        `[ResumeProcessingWorker] CRITICAL: Resume processing failed for "${resumeId}", but updating database status to FAILED also failed! Database state requires manual reconciliation.`
                    );
                }

                // Update Redis failure state
                await ResumeProcessingStateService.markFailed(resumeId, errorMessage);

                // Notify candidate over Socket.IO that resume processing permanently failed (even if DB update failed)
                await ResumeProgressPublisher.publishFinalFailure(
                    { jobId, resumeId, candidateId },
                    errorMessage
                );
            } else {
                // Temporary retry attempt: Record failure/retry in Redis
                await ResumeProcessingStateService.setCurrentStage(resumeId, "FAILED", `Retry scheduled: ${errorMessage}`);
            }

            if (isPermanent) {
                // Tell BullMQ to never retry this job
                throw new UnrecoverableError(errorMessage);
            }

            // Transient error: rethrow so BullMQ triggers exponential backoff retry
            throw error;
        }
    }

    /**
     * Determines whether an error is permanent (non-retryable) or transient.
     */
    public isPermanentError(error: unknown): boolean {
        if (error instanceof UnrecoverableError) return true;
        if (error instanceof UnsupportedFileTypeError) return true;
        if (error instanceof EmptyDocumentTextError) return true;
        if (error instanceof ScannedPdfDetectedError) return true;
        if (error instanceof BadRequestError) return true;
        if (error instanceof NotFoundError) return true;

        if (error instanceof OpenRouterError) {
            const permanentCodes = [400, 401, 403, 404];
            if (error.statusCode && permanentCodes.includes(error.statusCode)) {
                return true;
            }
        }

        if (error instanceof Error) {
            const msg = error.message.toLowerCase();
            if (
                msg.includes("unsupported file type") ||
                msg.includes("document buffer cannot be empty") ||
                msg.includes("cannot be empty for parsing") ||
                msg.includes("scanned pdf") ||
                msg.includes("failed validation") ||
                msg.includes("candidate not found")
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Helper to update Resume status and metadata in database.
     * Note: Critical errors propagate to ensure database failures are not masked.
     */
    private async updateResumeStatus(
        resumeId: string,
        parsingStatus: "UPLOADED" | "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED",
        additionalData: Partial<Prisma.ResumeUpdateInput> = {}
    ): Promise<void> {
        try {
            await prisma.resume.update({
                where: { id: resumeId },
                data: {
                    parsingStatus,
                    ...additionalData
                }
            });
        } catch (error) {
            logger.error(
                { err: error, resumeId, parsingStatus },
                `[ResumeProcessingWorker] Failed to update resume parsing status to "${parsingStatus}"`
            );
            throw error;
        }
    }

    /**
     * Attaches lifecycle event listeners to the BullMQ worker instance.
     */
    private attachEventListeners(): void {
        if (!this.worker) return;

        this.worker.on("completed", (job: Job) => {
            logger.info(
                {
                    event: "WORKER_JOB_COMPLETED",
                    jobId: job.id,
                    resumeId: job.data.resumeId
                },
                `[ResumeProcessingWorker] Job "${job.id}" completed successfully`
            );
        });

        this.worker.on("failed", (job: Job | undefined, error: Error) => {
            logger.error(
                {
                    event: "WORKER_JOB_FAILED",
                    jobId: job?.id,
                    resumeId: job?.data?.resumeId,
                    err: error.message
                },
                `[ResumeProcessingWorker] Job "${job?.id}" failed: ${error.message}`
            );
        });

        this.worker.on("error", (error: Error) => {
            logger.error({ err: error }, "[ResumeProcessingWorker] Internal worker error");
        });

        this.worker.on("stalled", (jobId: string) => {
            logger.warn({ jobId }, `[ResumeProcessingWorker] Job "${jobId}" stalled and will be reprocessed`);
        });
    }

    /**
     * Gracefully closes the worker.
     */
    public async close(): Promise<void> {
        if (this.worker) {
            logger.info("[ResumeProcessingWorker] Closing worker...");
            await this.worker.close();
            this.worker = null;
            logger.info("[ResumeProcessingWorker] Worker closed gracefully.");
        }
    }
}

let resumeWorkerInstance: ResumeProcessingWorker | null = null;

export function getResumeProcessingWorker(): ResumeProcessingWorker {
    if (!resumeWorkerInstance) {
        resumeWorkerInstance = new ResumeProcessingWorker();
    }
    return resumeWorkerInstance;
}
