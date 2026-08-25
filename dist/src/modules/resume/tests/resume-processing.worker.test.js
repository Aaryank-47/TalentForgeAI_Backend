import { describe, expect, it, jest, beforeEach, afterEach } from "@jest/globals";
import { UnrecoverableError } from "bullmq";
import prisma from "../../../config/database.js";
import { OpenRouterError } from "../../../common/integrations/openRouter/errors/openrouter.error.js";
import { EmptyDocumentTextError, ScannedPdfDetectedError, UnsupportedFileTypeError } from "../errors/document-extraction.errors.js";
import { ResumeProcessingPipeline } from "../pipelines/resume-processing.pipeline.js";
import { ResumeProcessingWorker } from "../queues/resume-processing.worker.js";
import { ResumeProgressPublisher } from "../websocket/resume-progress.publisher.js";
describe("ResumeProcessingWorker", () => {
    let mockPipeline;
    let worker;
    let publishCompletedSpy;
    let publishFinalFailureSpy;
    const mockParsedResult = {
        personal: {
            fullName: "John Doe",
            email: "john@example.com",
            phoneNumber: "+1234567890",
            currentLocation: "New York",
            linkedinUrl: "https://linkedin.com/in/johndoe",
            githubUrl: null,
            portfolioUrl: null,
            websiteUrl: null
        },
        professional: {
            headline: "Senior Software Engineer",
            bio: "Experienced developer",
            currentCompany: "Tech Corp",
            currentDesignation: "Staff Engineer",
            totalExperience: 7
        },
        skills: [
            { name: "TypeScript", yearsOfExperience: 5 },
            { name: "Node.js", yearsOfExperience: 6 }
        ],
        experience: [],
        education: [],
        projects: [{ name: "TalentForge", description: "AI Platform" }],
        certifications: [{ name: "AWS Certified Architect" }]
    };
    const mockPersistenceResult = {
        candidateId: "candidate-123",
        skillsCreated: 2,
        skillsUpdated: 0,
        experiencesCreated: 0,
        experiencesUpdated: 0,
        educationCreated: 0,
        educationUpdated: 0,
        projectsCreated: 1,
        projectsUpdated: 0,
        certificationsCreated: 1,
        certificationsUpdated: 0
    };
    beforeEach(() => {
        mockPipeline = {
            execute: jest.fn()
        };
        worker = new ResumeProcessingWorker(mockPipeline);
        publishCompletedSpy = jest.spyOn(ResumeProgressPublisher, "publishCompleted").mockResolvedValue(undefined);
        publishFinalFailureSpy = jest.spyOn(ResumeProgressPublisher, "publishFinalFailure").mockResolvedValue(undefined);
        jest.spyOn(prisma.resume, "findUnique").mockResolvedValue({
            id: "resume-123",
            parsingStatus: "QUEUED"
        });
        jest.spyOn(prisma.resume, "update").mockResolvedValue({});
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it("successfully delegates processing to pipeline and updates status: QUEUED -> PROCESSING -> DB COMPLETED -> Socket COMPLETED", async () => {
        mockPipeline.execute.mockResolvedValue({
            parsedData: mockParsedResult,
            normalizedData: mockParsedResult,
            persistenceResult: mockPersistenceResult,
            durationMs: 450
        });
        const mockJob = {
            id: "job-1",
            data: {
                candidateId: "candidate-123",
                resumeId: "resume-123",
                fileReference: "https://res.cloudinary.com/test/resume.pdf",
                mimeType: "application/pdf"
            },
            attemptsMade: 0,
            opts: { attempts: 3 }
        };
        const result = await worker.processJob(mockJob);
        expect(result.success).toBe(true);
        expect(result.resumeId).toBe("resume-123");
        expect(result.candidateId).toBe("candidate-123");
        expect(result.skillsCount).toBe(2);
        // Verify status transitions in Prisma
        expect(prisma.resume.update).toHaveBeenCalledWith({
            where: { id: "resume-123" },
            data: expect.objectContaining({
                parsingStatus: "PROCESSING"
            })
        });
        expect(mockPipeline.execute).toHaveBeenCalledWith(mockJob.data, "job-1", expect.any(Function));
        // Verify DB updated to COMPLETED before socket completed event
        expect(prisma.resume.update).toHaveBeenCalledWith({
            where: { id: "resume-123" },
            data: expect.objectContaining({
                parsingStatus: "COMPLETED",
                rawParsedData: mockParsedResult
            })
        });
        // Verify Socket.IO COMPLETED event published with correct metadata
        expect(publishCompletedSpy).toHaveBeenCalledWith({
            jobId: "job-1",
            resumeId: "resume-123",
            candidateId: "candidate-123"
        });
    });
    it("does NOT emit Socket.IO COMPLETED if final database status update fails, and propagates error to BullMQ", async () => {
        mockPipeline.execute.mockResolvedValue({
            parsedData: mockParsedResult,
            normalizedData: mockParsedResult,
            persistenceResult: mockPersistenceResult,
            durationMs: 450
        });
        // Initial PROCESSING update succeeds, but COMPLETED update fails
        jest.spyOn(prisma.resume, "update")
            .mockResolvedValueOnce({}) // PROCESSING succeeds
            .mockRejectedValueOnce(new Error("Database deadlock during COMPLETED update")); // COMPLETED fails
        const mockJob = {
            id: "job-db-completed-fail",
            data: {
                candidateId: "candidate-123",
                resumeId: "resume-123",
                fileReference: "https://res.cloudinary.com/test/resume.pdf",
                mimeType: "application/pdf"
            },
            attemptsMade: 0,
            opts: { attempts: 3 }
        };
        await expect(worker.processJob(mockJob)).rejects.toThrow("Database deadlock during COMPLETED update");
        // CRITICAL INVARIANT: publishCompleted must NOT have been called
        expect(publishCompletedSpy).not.toHaveBeenCalled();
    });
    it("skips processing if resume is already COMPLETED (idempotency)", async () => {
        jest.spyOn(prisma.resume, "findUnique").mockResolvedValue({
            id: "resume-123",
            parsingStatus: "COMPLETED"
        });
        const mockJob = {
            id: "job-duplicate",
            data: {
                candidateId: "candidate-123",
                resumeId: "resume-123",
                fileReference: "https://res.cloudinary.com/test/resume.pdf",
                mimeType: "application/pdf"
            },
            attemptsMade: 0,
            opts: { attempts: 3 }
        };
        const result = await worker.processJob(mockJob);
        expect(result.success).toBe(true);
        expect(mockPipeline.execute).not.toHaveBeenCalled();
        expect(publishCompletedSpy).not.toHaveBeenCalled();
    });
    it("propagates critical Prisma status update error to BullMQ", async () => {
        jest.spyOn(prisma.resume, "update").mockRejectedValue(new Error("Database connection lost"));
        const mockJob = {
            id: "job-db-fail",
            data: {
                candidateId: "candidate-123",
                resumeId: "resume-123",
                fileReference: "https://res.cloudinary.com/test/resume.pdf",
                mimeType: "application/pdf"
            },
            attemptsMade: 0,
            opts: { attempts: 3 }
        };
        await expect(worker.processJob(mockJob)).rejects.toThrow("Database connection lost");
    });
    it("handles transient error: rethrows regular error for BullMQ retry without publishing final failure", async () => {
        const transientError = new Error("Network connection reset by peer");
        mockPipeline.execute.mockRejectedValue(transientError);
        const mockJob = {
            id: "job-transient",
            data: {
                candidateId: "candidate-123",
                resumeId: "resume-123",
                fileReference: "https://res.cloudinary.com/test/resume.pdf",
                mimeType: "application/pdf"
            },
            attemptsMade: 0,
            opts: { attempts: 3 }
        };
        await expect(worker.processJob(mockJob)).rejects.toThrow("Network connection reset by peer");
        // On attempt 1 of 3, transient error does NOT yet mark FAILED in DB
        expect(prisma.resume.update).not.toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ parsingStatus: "FAILED" })
        }));
        // Does NOT emit final failure on transient attempt 1
        expect(publishFinalFailureSpy).not.toHaveBeenCalled();
    });
    it("marks FAILED and emits final failure on final attempt for transient errors", async () => {
        const transientError = new Error("Persistent timeout after multiple retries");
        mockPipeline.execute.mockRejectedValue(transientError);
        const mockJob = {
            id: "job-transient-final",
            data: {
                candidateId: "candidate-123",
                resumeId: "resume-123",
                fileReference: "https://res.cloudinary.com/test/resume.pdf",
                mimeType: "application/pdf"
            },
            attemptsMade: 2, // 3rd attempt
            opts: { attempts: 3 }
        };
        await expect(worker.processJob(mockJob)).rejects.toThrow("Persistent timeout after multiple retries");
        expect(prisma.resume.update).toHaveBeenCalledWith({
            where: { id: "resume-123" },
            data: expect.objectContaining({
                parsingStatus: "FAILED",
                parsingError: "Persistent timeout after multiple retries"
            })
        });
        expect(publishFinalFailureSpy).toHaveBeenCalledWith({
            jobId: "job-transient-final",
            resumeId: "resume-123",
            candidateId: "candidate-123"
        }, "Persistent timeout after multiple retries");
    });
    it("handles permanent error (unsupported file): throws UnrecoverableError and marks FAILED immediately with Socket event", async () => {
        const permanentError = new UnsupportedFileTypeError("text/plain");
        mockPipeline.execute.mockRejectedValue(permanentError);
        const mockJob = {
            id: "job-perm-1",
            data: {
                candidateId: "candidate-123",
                resumeId: "resume-123",
                fileReference: "https://res.cloudinary.com/test/resume.txt",
                mimeType: "text/plain"
            },
            attemptsMade: 0,
            opts: { attempts: 3 }
        };
        await expect(worker.processJob(mockJob)).rejects.toThrow(UnrecoverableError);
        expect(prisma.resume.update).toHaveBeenCalledWith({
            where: { id: "resume-123" },
            data: expect.objectContaining({
                parsingStatus: "FAILED"
            })
        });
        expect(publishFinalFailureSpy).toHaveBeenCalled();
    });
    it("handles permanent error (scanned PDF): throws UnrecoverableError and marks FAILED immediately with Socket event", async () => {
        const scannedPdfError = new ScannedPdfDetectedError();
        mockPipeline.execute.mockRejectedValue(scannedPdfError);
        const mockJob = {
            id: "job-scanned",
            data: {
                candidateId: "candidate-123",
                resumeId: "resume-123",
                fileReference: "https://res.cloudinary.com/test/scanned.pdf",
                mimeType: "application/pdf"
            },
            attemptsMade: 0,
            opts: { attempts: 3 }
        };
        await expect(worker.processJob(mockJob)).rejects.toThrow(UnrecoverableError);
        expect(prisma.resume.update).toHaveBeenCalledWith({
            where: { id: "resume-123" },
            data: expect.objectContaining({
                parsingStatus: "FAILED"
            })
        });
        expect(publishFinalFailureSpy).toHaveBeenCalled();
    });
    it("handles OpenRouter 401/403/404 authentication error as permanent error with Socket event", async () => {
        const authError = new OpenRouterError("Unauthorized: invalid API key", 401);
        mockPipeline.execute.mockRejectedValue(authError);
        const mockJob = {
            id: "job-openrouter-auth",
            data: {
                candidateId: "candidate-123",
                resumeId: "resume-123",
                fileReference: "https://res.cloudinary.com/test/resume.pdf",
                mimeType: "application/pdf"
            },
            attemptsMade: 0,
            opts: { attempts: 3 }
        };
        await expect(worker.processJob(mockJob)).rejects.toThrow(UnrecoverableError);
        expect(prisma.resume.update).toHaveBeenCalledWith({
            where: { id: "resume-123" },
            data: expect.objectContaining({
                parsingStatus: "FAILED",
                parsingError: "Unauthorized: invalid API key"
            })
        });
        expect(publishFinalFailureSpy).toHaveBeenCalled();
    });
});
//# sourceMappingURL=resume-processing.worker.test.js.map