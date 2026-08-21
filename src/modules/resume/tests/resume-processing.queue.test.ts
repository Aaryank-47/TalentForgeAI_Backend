import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import {
    DEFAULT_RESUME_JOB_OPTIONS,
    addResumeProcessingJob,
    getResumeProcessingQueue
} from "../queues/resume-processing.queue.js";
import type { ResumeProcessingJobData } from "../queues/resume-processing.types.js";

describe("ResumeProcessingQueue", () => {
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
        const mockJob = { id: "resume-processing:resume-123" };
        const addSpy = jest.spyOn(queue, "add").mockResolvedValue(mockJob as any);

        const jobData: ResumeProcessingJobData = {
            candidateId: "candidate-456",
            resumeId: "resume-123",
            fileReference: "https://res.cloudinary.com/test/raw/upload/resume.pdf",
            mimeType: "application/pdf",
            originalName: "My_Resume.pdf"
        };

        const result = await addResumeProcessingJob(jobData);

        expect(result).toBe(mockJob);
        expect(addSpy).toHaveBeenCalledWith(
            "process-resume",
            jobData,
            expect.objectContaining({
                jobId: "resume-processing:resume-123",
                attempts: DEFAULT_RESUME_JOB_OPTIONS.attempts
            })
        );

        // Verify that the payload does not contain any buffer or large binary data
        expect((jobData as any).buffer).toBeUndefined();
        expect((jobData as any).fileBuffer).toBeUndefined();
    });
});
