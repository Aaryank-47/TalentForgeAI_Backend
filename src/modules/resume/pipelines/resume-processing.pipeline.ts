import { OpenRouterError } from "../../../common/integrations/openRouter/errors/openrouter.error.js";
import { logger } from "../../../common/logger/logger.js";
import { RESUME_MIME_TYPES } from "../constants/resume.constants.js";
import type { ResumeParsingResult } from "../interfaces/resume-parser.interface.js";
import type {
    StageChangeHandler,
    StageChangeMeta,
    PipelineExecutionResult
} from "../interfaces/resume-pipeline.interface.js";
import type {
    ResumeProcessingJobData,
    ResumeProcessingStage
} from "../queues/resume-processing.types.js";
import { DocumentExtractorService } from "../services/document-extractor.service.js";
import { ResumeNormalizationService } from "../services/resume-normalization.service.js";
import { ResumeParserService } from "../services/resume-parser.service.js";
import { ResumePersistenceService } from "../services/resume-persistence.service.js";
import { fetchFileBufferFromUrl } from "../utils/file-retrieval.helper.js";

export class ResumeProcessingPipeline {
    constructor(
        private readonly documentExtractorService: DocumentExtractorService = new DocumentExtractorService(),
        private readonly resumeParserService: ResumeParserService = new ResumeParserService(),
        private readonly resumeNormalizationService: ResumeNormalizationService = new ResumeNormalizationService(),
        private readonly resumePersistenceService: ResumePersistenceService = new ResumePersistenceService(),
        private readonly fileFetcher: (url: string) => Promise<Buffer> = fetchFileBufferFromUrl
    ) {}

    /**
     * Executes the explicit, hardened multi-stage resume processing pipeline:
     * 1. FETCHING_FILE
     * 2. EXTRACTION (when extracting text locally for DOCX or PDF fallback)
     * 3. AI_PARSING (calling OpenRouter for structured JSON)
     * 4. NORMALIZATION (deterministic schema, field & skill taxonomy normalization)
     * 5. PERSISTENCE (atomic database transactions)
     * 
     * Note: The final COMPLETED event and database status transition are orchestrated by the Worker
     * only after persistence succeeds and the database record is updated to COMPLETED.
     */
    public async execute(
        jobData: ResumeProcessingJobData,
        jobId: string,
        onStageChange?: StageChangeHandler
    ): Promise<PipelineExecutionResult> {
        const { candidateId, resumeId, fileReference, mimeType } = jobData;
        const startTime = performance.now();
        const baseMeta: StageChangeMeta = { jobId, resumeId, candidateId };

        const normalizedMimeType = mimeType ? mimeType.trim().toLowerCase() : "";

        // Stage 1: FETCHING_FILE
        await this.notifyStage("FETCHING_FILE", baseMeta, onStageChange);
        const documentBuffer = await this.fileFetcher(fileReference);

        // Stage 2 & 3: EXTRACTION & AI_PARSING
        let parsedData: ResumeParsingResult;

        if (normalizedMimeType === RESUME_MIME_TYPES.DOCX) {
            // DOCX path: Local text extraction is required before sending text to AI
            await this.notifyStage(
                "EXTRACTION", 
                { 
                    ...baseMeta, 
                    mode: "DIRECT" 
                }, 
                onStageChange
            );
                
            const extractionResult = await this.documentExtractorService.extractDocument(
                documentBuffer,
                normalizedMimeType
            );

            await this.notifyStage("AI_PARSING", { ...baseMeta, mode: "DIRECT" }, onStageChange);
            parsedData = await this.resumeParserService.parseResumeText(extractionResult.text);
        } else {
            // PDF / Image path: Attempt direct document parsing with OpenRouter
            await this.notifyStage(
                "AI_PARSING", 
                { 
                    ...baseMeta, 
                    mode: "DIRECT" 
                }, 
                onStageChange
            );
            try {
                parsedData = await this.resumeParserService.parseResumeDocument(
                    documentBuffer,
                    normalizedMimeType
                );
            } catch (error: unknown) {
                // Non-retryable OpenRouter auth / client configuration errors (401, 403, 404) must propagate immediately
                if (
                    error instanceof OpenRouterError &&
                    [401, 403, 404].includes(error.statusCode ?? 0)
                ) {
                    throw error;
                }

                const fallbackReason = error instanceof Error ? error.message : "Unknown direct parsing failure";

                logger.warn(
                    {
                        jobId,
                        resumeId,
                        err: fallbackReason
                    },
                    "[ResumeProcessingPipeline] Direct AI document parsing failed; falling back to local document text extraction..."
                );

                // Fallback: extract text locally, then call parseResumeText
                await this.notifyStage(
                    "EXTRACTION",
                    { ...baseMeta, mode: "FALLBACK", reason: fallbackReason },
                    onStageChange
                );
                const extractionResult = await this.documentExtractorService.extractDocument(
                    documentBuffer,
                    normalizedMimeType
                );

                await this.notifyStage("AI_PARSING", { ...baseMeta, mode: "FALLBACK" }, onStageChange);
                parsedData = await this.resumeParserService.parseResumeText(extractionResult.text);
            }
        }

        // Stage 4: NORMALIZATION
        await this.notifyStage(
            "NORMALIZATION", 
            baseMeta, 
            onStageChange
        );
        const normalizedData = await this.resumeNormalizationService.normalizeResumeData(parsedData);

        // Stage 5: PERSISTENCE
        await this.notifyStage(
            "PERSISTENCE", 
            baseMeta, 
            onStageChange
        );
        const persistenceResult = await this.resumePersistenceService.persistResumeData(
            candidateId,
            normalizedData
        );

        const durationMs = Math.round(performance.now() - startTime);

        return {
            parsedData,
            normalizedData,
            persistenceResult,
            durationMs
        };
    }

    private async notifyStage(
        stage: ResumeProcessingStage,
        meta: StageChangeMeta,
        onStageChange?: StageChangeHandler
    ): Promise<void> {
        logger.info(
            {
                event: `${stage}_STARTED`,
                jobId: meta.jobId,
                resumeId: meta.resumeId,
                candidateId: meta.candidateId,
                stage,
                mode: meta.mode,
                reason: meta.reason
            },
            `[ResumeProcessingPipeline] Stage "${stage}" executing for resume "${meta.resumeId}"${meta.mode ? ` (mode: ${meta.mode})` : ""}`
        );

        if (onStageChange) {
            try {
                await onStageChange(stage, meta);
            } catch (err: unknown) {
                // Stage notification failures (e.g. socket emit) should not break pipeline processing
                logger.warn(
                    { err, stage, resumeId: meta.resumeId },
                    `[ResumeProcessingPipeline] Stage change handler failed for stage "${stage}"`
                );
            }
        }
    }
}
