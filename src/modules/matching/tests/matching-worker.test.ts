import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { MatchingWorker } from "../queues/matching.worker.js";
import { MatchingService } from "../services/matching.service.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { UnrecoverableError } from "bullmq";

describe("MatchingWorker Unit Tests", () => {
    let worker: MatchingWorker;

    beforeEach(() => {
        worker = new MatchingWorker();
        jest.clearAllMocks();
    });

    it("should process MATCH_FOR_JOB task successfully", async () => {
        const spyMatchJob = jest.spyOn(MatchingService, "matchForJob").mockResolvedValue({
            jobId: "job_1",
            deterministicEvaluated: 15,
            aiEvaluated: 2,
            matchesPersisted: 12,
            durationMs: 45
        });

        const mockJob = {
            id: "match-job-job_1-v1",
            data: {
                type: "MATCH_FOR_JOB",
                jobId: "job_1",
                jobVersion: 1,
                timestamp: Date.now()
            },
            attemptsMade: 0
        } as any;

        const result = await worker.processJob(mockJob);

        expect(result.matchesPersisted).toBe(12);
        expect(spyMatchJob).toHaveBeenCalledWith("job_1");

        spyMatchJob.mockRestore();
    });

    it("should process MATCH_FOR_CANDIDATE task successfully", async () => {
        const spyMatchCandidate = jest.spyOn(MatchingService, "matchForCandidate").mockResolvedValue({
            candidateId: "cand_1",
            deterministicEvaluated: 25,
            aiEvaluated: 3,
            matchesPersisted: 18,
            durationMs: 60
        });

        const mockJob = {
            id: "match-candidate-cand_1-v1",
            data: {
                type: "MATCH_FOR_CANDIDATE",
                candidateId: "cand_1",
                candidateVersion: 1,
                timestamp: Date.now()
            },
            attemptsMade: 0
        } as any;

        const result = await worker.processJob(mockJob);

        expect(result.matchesPersisted).toBe(18);
        expect(spyMatchCandidate).toHaveBeenCalledWith("cand_1");

        spyMatchCandidate.mockRestore();
    });

    it("should convert NotFoundError into BullMQ UnrecoverableError so deleted entities are not retried endlessly", async () => {
        const spyMatchJob = jest.spyOn(MatchingService, "matchForJob").mockRejectedValue(
            new NotFoundError("Job deleted")
        );

        const mockJob = {
            id: "match-job-job_deleted-v1",
            data: {
                type: "MATCH_FOR_JOB",
                jobId: "job_deleted",
                jobVersion: 1,
                timestamp: Date.now()
            },
            attemptsMade: 0
        } as any;

        await expect(worker.processJob(mockJob)).rejects.toThrow(UnrecoverableError);

        spyMatchJob.mockRestore();
    });
});
