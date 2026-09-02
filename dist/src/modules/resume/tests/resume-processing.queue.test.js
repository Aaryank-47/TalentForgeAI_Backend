import { describe, expect, it, jest, beforeEach, afterAll } from "@jest/globals";
import { DEFAULT_RESUME_JOB_OPTIONS, addResumeProcessingJob, getResumeProcessingQueue, closeResumeProcessingQueue } from "../queues/resume-processing.queue.js";
describe("ResumeProcessingQueue", () => {
    afterAll(async () => {
        await closeResumeProcessingQueue();
    });
    it("defines sensible default job options with exponential backoff", () => {
        expect(DEFAULT_RESUME_JOB_OPTIONS.attempts).toBeGreaterThanOrEqual(1);
        expect(DEFAULT_RESUME_JOB_OPTIONS.backoff).toEqual({
            type: "exponential",
            delay: expect.any(Number)
        });
        expect(DEFAULT_RESUME_JOB_OPTIONS.removeOnComplete).toBeDefined();
        expect(DEFAULT_RESUME_JOB_OPTIONS.removeOnFail).toBeDefined();
    });
    it("enqueues job with deduplicated jobId and minimal payload", async () => {
        const queue = getResumeProcessingQueue();
        const mockJob = {
            id: "resume-processing-resume-123",
            getState: jest.fn().mockResolvedValue("waiting"),
            attemptsMade: 0,
            opts: { attempts: DEFAULT_RESUME_JOB_OPTIONS.attempts }
        };
        const addSpy = jest.spyOn(queue, "add").mockResolvedValue(mockJob);
        const jobData = {
            candidateId: "candidate-456",
            resumeId: "resume-123",
            fileReference: "https://res.cloudinary.com/test/raw/upload/resume.pdf",
            mimeType: "application/pdf",
            originalName: "My_Resume.pdf"
        };
        const result = await addResumeProcessingJob(jobData);
        expect(result).toBe(mockJob);
        expect(addSpy).toHaveBeenCalledWith("process-resume", jobData, expect.objectContaining({
            jobId: "resume-processing-resume-123",
            attempts: DEFAULT_RESUME_JOB_OPTIONS.attempts
        }));
        // Verify that the payload does not contain any buffer or large binary data
        expect(jobData.buffer).toBeUndefined();
        expect(jobData.fileBuffer).toBeUndefined();
    });
});
//# sourceMappingURL=resume-processing.queue.test.js.map