import { describe, expect, it, jest, beforeEach, afterEach, afterAll } from "@jest/globals";
import { CandidateService } from "../../candidate/services/candidate.service.js";
import { CandidateRepository } from "../../candidate/repository/candidate.repository.js";
import { AuthRepository } from "../../auth/repositories/auth.repository.js";
import {
    addResumeProcessingJob,
    getResumeProcessingQueue,
    closeResumeProcessingQueue
} from "../queues/resume-processing.queue.js";
import { ResumeProgressPublisher } from "../websocket/resume-progress.publisher.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import prisma from "../../../config/database.js";
import { inferResumeMimeType } from "../utils/resume-mime.helper.js";
import { RESUME_MIME_TYPES } from "../constants/resume.constants.js";
import { closeMatchingQueue } from "../../matching/queues/matching.queue.js";

describe("Resume Processing - Manual Retry Mechanism", () => {
    const candidateId = "candidate-test-123";
    const resumeId = "resume-test-456";

    afterAll(async () => {
        await closeResumeProcessingQueue();
        await closeMatchingQueue();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("MIME Type Inference Helper", () => {
        it("infers DOCX MIME type for .docx files", () => {
            expect(inferResumeMimeType("Resume.docx")).toBe(RESUME_MIME_TYPES.DOCX);
            expect(inferResumeMimeType("My_CV.DOCX")).toBe(RESUME_MIME_TYPES.DOCX);
        });

        it("infers PDF MIME type for .pdf files", () => {
            expect(inferResumeMimeType("Resume.pdf")).toBe(RESUME_MIME_TYPES.PDF);
            expect(inferResumeMimeType("My_CV.PDF")).toBe(RESUME_MIME_TYPES.PDF);
        });

        it("infers image MIME types for image formats", () => {
            expect(inferResumeMimeType("scan.png")).toBe(RESUME_MIME_TYPES.PNG);
            expect(inferResumeMimeType("scan.jpg")).toBe(RESUME_MIME_TYPES.JPEG);
            expect(inferResumeMimeType("scan.webp")).toBe(RESUME_MIME_TYPES.WEBP);
        });

        it("defaults to PDF for missing or unrecognized extensions", () => {
            expect(inferResumeMimeType(null)).toBe(RESUME_MIME_TYPES.PDF);
            expect(inferResumeMimeType("unknown_file")).toBe(RESUME_MIME_TYPES.PDF);
        });
    });

    describe("addResumeProcessingJob - ID Strategy", () => {
        it("Requirement A: Initial processing uses deterministic jobId resume-processing-${resumeId}", async () => {
            const queue = getResumeProcessingQueue();
            const mockJob = { id: `resume-processing-${resumeId}`, getState: jest.fn().mockResolvedValue("waiting" as never) };
            const addSpy = jest.spyOn(queue, "add").mockResolvedValue(mockJob as any);

            const job = await addResumeProcessingJob({
                candidateId,
                resumeId,
                fileReference: "https://cloudinary.com/test.pdf",
                mimeType: "application/pdf",
                originalName: "test.pdf"
            });

            expect(job.id).toBe(`resume-processing-${resumeId}`);
            expect(addSpy).toHaveBeenCalledWith(
                "process-resume",
                expect.any(Object),
                expect.objectContaining({
                    jobId: `resume-processing-${resumeId}`
                })
            );
        });

        it("Requirement B & C: Manual retry accepts a unique retry jobId", async () => {
            const queue = getResumeProcessingQueue();
            const customRetryJobId = `resume-processing-${resumeId}-retry-1`;
            const mockJob = { id: customRetryJobId, getState: jest.fn().mockResolvedValue("waiting" as never) };
            const addSpy = jest.spyOn(queue, "add").mockResolvedValue(mockJob as any);

            const job = await addResumeProcessingJob(
                {
                    candidateId,
                    resumeId,
                    fileReference: "https://cloudinary.com/test.pdf",
                    mimeType: "application/pdf",
                    originalName: "test.pdf"
                },
                { jobId: customRetryJobId }
            );

            expect(job.id).toBe(customRetryJobId);
            expect(addSpy).toHaveBeenCalledWith(
                "process-resume",
                expect.any(Object),
                expect.objectContaining({
                    jobId: customRetryJobId
                })
            );
        });
    });

    describe("CandidateService.retryResumeProcessing", () => {
        it("Requirement H: Rejects retry if resume is already COMPLETED", async () => {
            jest.spyOn(AuthRepository, "findProfileByUserId").mockResolvedValue({
                profile: { isOpenToWork: true }
            } as any);

            jest.spyOn(CandidateRepository, "findResumeBelongToUser").mockResolvedValue([
                {
                    id: resumeId,
                    candidateId,
                    parsingStatus: "COMPLETED",
                    resumeName: "test.pdf",
                    resumeUrl: "https://cloudinary.com/test.pdf"
                }
            ] as any);

            await expect(CandidateService.retryResumeProcessing(resumeId, candidateId)).rejects.toThrow(
                ConflictError
            );
            await expect(CandidateService.retryResumeProcessing(resumeId, candidateId)).rejects.toThrow(
                "Resume has already been successfully processed"
            );
        });

        it("Requirement I: Rejects retry if resume is currently PROCESSING", async () => {
            jest.spyOn(AuthRepository, "findProfileByUserId").mockResolvedValue({
                profile: { isOpenToWork: true }
            } as any);

            jest.spyOn(CandidateRepository, "findResumeBelongToUser").mockResolvedValue([
                {
                    id: resumeId,
                    candidateId,
                    parsingStatus: "PROCESSING",
                    resumeName: "test.pdf",
                    resumeUrl: "https://cloudinary.com/test.pdf"
                }
            ] as any);

            await expect(CandidateService.retryResumeProcessing(resumeId, candidateId)).rejects.toThrow(
                ConflictError
            );
            await expect(CandidateService.retryResumeProcessing(resumeId, candidateId)).rejects.toThrow(
                "Resume is currently being processed"
            );
        });

        it("Requirement D, E & K: Successfully retries FAILED resume, creates unique job, resets DB to QUEUED, and notifies Socket.IO", async () => {
            jest.spyOn(AuthRepository, "findProfileByUserId").mockResolvedValue({
                profile: { isOpenToWork: true }
            } as any);

            jest.spyOn(CandidateRepository, "findResumeBelongToUser").mockResolvedValue([
                {
                    id: resumeId,
                    candidateId,
                    parsingStatus: "FAILED",
                    resumeName: "test.docx",
                    resumeUrl: "https://cloudinary.com/test.docx"
                }
            ] as any);

            jest.spyOn(CandidateRepository, "resetResumeForRetry").mockResolvedValue({
                id: resumeId,
                candidateId,
                parsingStatus: "QUEUED",
                resumeName: "test.docx",
                resumeUrl: "https://cloudinary.com/test.docx",
                fileSize: 1024
            } as any);

            const queue = getResumeProcessingQueue();
            jest.spyOn(queue, "getJob").mockResolvedValue(undefined);

            const mockJob = {
                id: `resume-processing-${resumeId}-retry-1`,
                attemptsMade: 0,
                getState: jest.fn<any>().mockResolvedValue("waiting")
            };
            jest.spyOn(queue, "add").mockResolvedValue(mockJob as any);

            const publishSpy = jest.spyOn(ResumeProgressPublisher, "publishStageChange").mockResolvedValue(undefined as any);

            const result = await CandidateService.retryResumeProcessing(resumeId, candidateId);

            expect(CandidateRepository.resetResumeForRetry).toHaveBeenCalledWith(resumeId);
            expect(result).toEqual({
                resumeId,
                jobId: `resume-processing-${resumeId}-retry-1`,
                status: "QUEUED"
            });

            expect(publishSpy).toHaveBeenCalledWith("QUEUED", {
                resumeId,
                jobId: `resume-processing-${resumeId}-retry-1`,
                candidateId
            });
        });

        it("Requirement G: Multiple manual retries calculate incremented attempt counters (retry-1, retry-2)", async () => {
            jest.spyOn(AuthRepository, "findProfileByUserId").mockResolvedValue({
                profile: { isOpenToWork: true }
            } as any);

            jest.spyOn(CandidateRepository, "findResumeBelongToUser").mockResolvedValue([
                {
                    id: resumeId,
                    candidateId,
                    parsingStatus: "FAILED",
                    resumeName: "test.pdf",
                    resumeUrl: "https://cloudinary.com/test.pdf"
                }
            ] as any);

            jest.spyOn(CandidateRepository, "resetResumeForRetry").mockResolvedValue({
                id: resumeId,
                candidateId,
                parsingStatus: "QUEUED",
                resumeName: "test.pdf",
                resumeUrl: "https://cloudinary.com/test.pdf",
                fileSize: 1024
            } as any);

            const queue = getResumeProcessingQueue();
            // Simulate that retry-1 already exists in Redis
            jest.spyOn(queue, "getJob").mockImplementation(async (jobId: string) => {
                if (jobId === `resume-processing-${resumeId}-retry-1`) {
                    return { id: jobId } as any;
                }
                return null;
            });

            const mockJob = {
                id: `resume-processing-${resumeId}-retry-2`,
                attemptsMade: 0,
                getState: jest.fn<any>().mockResolvedValue("waiting")
            };
            jest.spyOn(queue, "add").mockResolvedValue(mockJob as any);

            const result = await CandidateService.retryResumeProcessing(resumeId, candidateId);

            expect(result.jobId).toBe(`resume-processing-${resumeId}-retry-2`);
        });

        it("Requirement 6: Reverts DB status to FAILED if queue enqueueing throws an error", async () => {
            jest.spyOn(AuthRepository, "findProfileByUserId").mockResolvedValue({
                profile: { isOpenToWork: true }
            } as any);

            jest.spyOn(CandidateRepository, "findResumeBelongToUser").mockResolvedValue([
                {
                    id: resumeId,
                    candidateId,
                    parsingStatus: "FAILED",
                    resumeName: "test.pdf",
                    resumeUrl: "https://cloudinary.com/test.pdf"
                }
            ] as any);

            jest.spyOn(CandidateRepository, "resetResumeForRetry").mockResolvedValue({
                id: resumeId,
                candidateId,
                parsingStatus: "QUEUED",
                resumeName: "test.pdf",
                resumeUrl: "https://cloudinary.com/test.pdf",
                fileSize: 1024
            } as any);

            const queue = getResumeProcessingQueue();
            jest.spyOn(queue, "getJob").mockResolvedValue(undefined);
            jest.spyOn(queue, "add").mockRejectedValue(new Error("Redis connection timed out"));

            const revertSpy = jest.spyOn(prisma.resume, "update").mockResolvedValue({} as any);

            await expect(CandidateService.retryResumeProcessing(resumeId, candidateId)).rejects.toThrow(
                "Redis connection timed out"
            );

            expect(revertSpy).toHaveBeenCalledWith({
                where: { id: resumeId },
                data: expect.objectContaining({
                    parsingStatus: "FAILED",
                    parsingError: expect.stringContaining("Failed to queue resume")
                })
            });
        });
    });

    describe("Worker Execution of Manual Retry Job (QUEUED -> PROCESSING -> COMPLETED/FAILED)", () => {
        it("Requirement D & E: Worker receives the manual retry job, updates DB to PROCESSING, and completes pipeline", async () => {
            const mockPipeline = {
                execute: jest.fn<any>().mockResolvedValue({
                    normalizedData: {
                        personal: { fullName: "Aaryan Kamalwanshi" },
                        skills: [{ name: "TypeScript", yearsOfExperience: 3 }],
                        experience: [],
                        education: [],
                        projects: [],
                        certifications: []
                    },
                    persistenceResult: { candidateId, skillsCreated: 1 },
                    durationMs: 120
                })
            };

            const worker = new (await import("../queues/resume-processing.worker.js")).ResumeProcessingWorker(
                mockPipeline as any,
                jest.fn() as any
            );

            const prismaFindSpy = jest.spyOn(prisma.resume, "findUnique").mockResolvedValue({
                id: resumeId,
                parsingStatus: "QUEUED"
            } as any);

            const prismaUpdateSpy = jest.spyOn(prisma.resume, "update").mockResolvedValue({} as any);
            const publishCompletedSpy = jest.spyOn(ResumeProgressPublisher, "publishCompleted").mockResolvedValue(undefined as any);

            const mockJob = {
                id: `resume-processing-${resumeId}-retry-1`,
                data: {
                    candidateId,
                    resumeId,
                    fileReference: "https://cloudinary.com/test.pdf",
                    mimeType: "application/pdf"
                },
                opts: { attempts: 3 },
                attemptsMade: 0
            };

            const result = await worker.processJob(mockJob as any);

            expect(result.success).toBe(true);
            expect(result.resumeId).toBe(resumeId);

            // Verified state transitions in database:
            // 1. Worker transitions QUEUED -> PROCESSING
            expect(prismaUpdateSpy).toHaveBeenNthCalledWith(1, {
                where: { id: resumeId },
                data: expect.objectContaining({
                    parsingStatus: "PROCESSING"
                })
            });

            // 2. Worker executes pipeline
            expect(mockPipeline.execute).toHaveBeenCalledWith(
                mockJob.data,
                mockJob.id,
                expect.any(Function)
            );

            // 3. Worker transitions PROCESSING -> COMPLETED
            expect(prismaUpdateSpy).toHaveBeenNthCalledWith(2, {
                where: { id: resumeId },
                data: expect.objectContaining({
                    parsingStatus: "COMPLETED"
                })
            });

            expect(publishCompletedSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    jobId: mockJob.id,
                    resumeId
                })
            );
        });
    });
});

