import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { MatchingEventsPublisher } from "../events/matching-events.publisher.js";
import { MatchingRepository } from "../repositories/matching.repository.js";
import { MatchingQueueService } from "../queues/matching.queue.js";

describe("MatchingEventsPublisher Unit Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Candidate Matching Events", () => {
        it("should trigger matching when skills or experience change", async () => {
            const spyIncrement = jest
                .spyOn(MatchingRepository, "incrementCandidateProfileVersion")
                .mockResolvedValue(2);
            const spyMarkStale = jest
                .spyOn(MatchingRepository, "markMatchesStaleForCandidate")
                .mockResolvedValue();
            const spyAddTask = jest
                .spyOn(MatchingQueueService, "addMatchForCandidateTask")
                .mockResolvedValue({ id: "job-1" } as any);

            const result = await MatchingEventsPublisher.onCandidateMatchingDataChanged(
                "cand_123",
                ["skills", "totalExperience"]
            );

            expect(result).toBe(true);
            expect(spyIncrement).toHaveBeenCalledWith("cand_123");
            expect(spyMarkStale).toHaveBeenCalledWith("cand_123");
            expect(spyAddTask).toHaveBeenCalledWith("cand_123", 2);

            spyIncrement.mockRestore();
            spyMarkStale.mockRestore();
            spyAddTask.mockRestore();
        });

        it("should NOT trigger matching when only irrelevant fields change (e.g. bio, phone, picture)", async () => {
            const spyIncrement = jest.spyOn(MatchingRepository, "incrementCandidateProfileVersion");
            const spyAddTask = jest.spyOn(MatchingQueueService, "addMatchForCandidateTask");

            const result = await MatchingEventsPublisher.onCandidateMatchingDataChanged(
                "cand_123",
                ["profilePicture", "phoneNumber", "bio", "websiteUrl"]
            );

            expect(result).toBe(false);
            expect(spyIncrement).not.toHaveBeenCalled();
            expect(spyAddTask).not.toHaveBeenCalled();

            spyIncrement.mockRestore();
            spyAddTask.mockRestore();
        });

        it("should trigger matching on RESUME_PARSED event", async () => {
            const spyIncrement = jest
                .spyOn(MatchingRepository, "incrementCandidateProfileVersion")
                .mockResolvedValue(3);
            const spyMarkStale = jest
                .spyOn(MatchingRepository, "markMatchesStaleForCandidate")
                .mockResolvedValue();
            const spyAddTask = jest
                .spyOn(MatchingQueueService, "addMatchForCandidateTask")
                .mockResolvedValue({ id: "job-2" } as any);

            const result = await MatchingEventsPublisher.onCandidateMatchingDataChanged(
                "cand_123",
                ["RESUME_PARSED"]
            );

            expect(result).toBe(true);
            expect(spyIncrement).toHaveBeenCalledWith("cand_123");
            expect(spyAddTask).toHaveBeenCalledWith("cand_123", 3);

            spyIncrement.mockRestore();
            spyMarkStale.mockRestore();
            spyAddTask.mockRestore();
        });
    });

    describe("Job Matching Events", () => {
        it("should trigger matching when job requirements update", async () => {
            const spyIncrement = jest
                .spyOn(MatchingRepository, "incrementJobRequirementsVersion")
                .mockResolvedValue(2);
            const spyMarkStale = jest
                .spyOn(MatchingRepository, "markMatchesStaleForJob")
                .mockResolvedValue();
            const spyAddTask = jest
                .spyOn(MatchingQueueService, "addMatchForJobTask")
                .mockResolvedValue({ id: "job-task-1" } as any);

            const result = await MatchingEventsPublisher.onJobMatchingDataChanged("job_123", [
                "skills",
                "minExperience"
            ]);

            expect(result).toBe(true);
            expect(spyIncrement).toHaveBeenCalledWith("job_123");
            expect(spyMarkStale).toHaveBeenCalledWith("job_123");
            expect(spyAddTask).toHaveBeenCalledWith("job_123", 2);

            spyIncrement.mockRestore();
            spyMarkStale.mockRestore();
            spyAddTask.mockRestore();
        });

        it("should trigger matching when job status changes to PUBLISHED", async () => {
            const spyIncrement = jest
                .spyOn(MatchingRepository, "incrementJobRequirementsVersion")
                .mockResolvedValue(1);
            const spyMarkStale = jest
                .spyOn(MatchingRepository, "markMatchesStaleForJob")
                .mockResolvedValue();
            const spyAddTask = jest
                .spyOn(MatchingQueueService, "addMatchForJobTask")
                .mockResolvedValue({ id: "job-task-2" } as any);

            const result = await MatchingEventsPublisher.onJobMatchingDataChanged("job_123", [
                "PUBLISHED",
                "status"
            ]);

            expect(result).toBe(true);
            expect(spyIncrement).toHaveBeenCalledWith("job_123");
            expect(spyAddTask).toHaveBeenCalledWith("job_123", 1);

            spyIncrement.mockRestore();
            spyMarkStale.mockRestore();
            spyAddTask.mockRestore();
        });

        it("should NOT trigger matching when only non-matching job fields change", async () => {
            const spyIncrement = jest.spyOn(MatchingRepository, "incrementJobRequirementsVersion");
            const spyAddTask = jest.spyOn(MatchingQueueService, "addMatchForJobTask");

            const result = await MatchingEventsPublisher.onJobMatchingDataChanged("job_123", [
                "hideSalary",
                "applicationDeadline"
            ]);

            expect(result).toBe(false);
            expect(spyIncrement).not.toHaveBeenCalled();
            expect(spyAddTask).not.toHaveBeenCalled();

            spyIncrement.mockRestore();
            spyAddTask.mockRestore();
        });
    });
});
