import { logger } from "../../../common/logger/logger.js";
import { MatchingRepository } from "../repositories/matching.repository.js";
import { MatchingQueueService } from "../queues/matching.queue.js";
const MATCHING_RELEVANT_CANDIDATE_FIELDS = new Set([
    "skills",
    "experience",
    "experiences",
    "education",
    "educations",
    "certifications",
    "projects",
    "totalExperience",
    "experienceLevel",
    "currentDesignation",
    "currentLocation",
    "preferredLocation",
    "isOpenToWork",
    "RESUME_PARSED",
    "FORCE_RECALCULATE"
]);
const MATCHING_RELEVANT_JOB_FIELDS = new Set([
    "title",
    "description",
    "summary",
    "skills",
    "minExperience",
    "maxExperience",
    "workplaceType",
    "location",
    "employmentType",
    "status",
    "PUBLISHED",
    "FORCE_RECALCULATE"
]);
export class MatchingEventsPublisher {
    /**
     * Triggered when candidate profile information updates.
     * Evaluates whether changes affect matching before enqueuing work.
     */
    static async onCandidateMatchingDataChanged(candidateId, changedFields) {
        const fieldNames = Array.isArray(changedFields)
            ? changedFields
            : Object.keys(changedFields);
        const isRelevant = fieldNames.some((field) => MATCHING_RELEVANT_CANDIDATE_FIELDS.has(field));
        if (!isRelevant) {
            logger.info({
                event: "CANDIDATE_MATCHING_CHANGE_SKIPPED",
                candidateId,
                fields: fieldNames
            }, `[MatchingEvents] Candidate "${candidateId}" updated non-matching fields (${fieldNames.join(", ")}). Skipping matching recalculation.`);
            return false;
        }
        try {
            // Increment candidate profile version in DB
            const newVersion = await MatchingRepository.incrementCandidateProfileVersion(candidateId);
            // Mark existing matches as STALE (they remain readable by frontend)
            await MatchingRepository.markMatchesStaleForCandidate(candidateId);
            // Enqueue targeted background calculation
            await MatchingQueueService.addMatchForCandidateTask(candidateId, newVersion);
            logger.info({
                event: "CANDIDATE_MATCHING_EVENT_PUBLISHED",
                candidateId,
                newVersion,
                fields: fieldNames
            }, `[MatchingEvents] Triggered matching recalculation for candidate "${candidateId}" (v${newVersion})`);
            return true;
        }
        catch (error) {
            logger.error({
                err: error,
                candidateId,
                fields: fieldNames
            }, `[MatchingEvents] Failed to publish matching event for candidate "${candidateId}"`);
            return false;
        }
    }
    /**
     * Triggered when job requirements or status updates.
     */
    static async onJobMatchingDataChanged(jobId, changedFields) {
        const fieldNames = Array.isArray(changedFields)
            ? changedFields
            : Object.keys(changedFields);
        const isRelevant = fieldNames.some((field) => MATCHING_RELEVANT_JOB_FIELDS.has(field));
        if (!isRelevant) {
            logger.info({
                event: "JOB_MATCHING_CHANGE_SKIPPED",
                jobId,
                fields: fieldNames
            }, `[MatchingEvents] Job "${jobId}" updated non-matching fields (${fieldNames.join(", ")}). Skipping matching recalculation.`);
            return false;
        }
        try {
            // 1. Increment job requirements version in DB
            const newVersion = await MatchingRepository.incrementJobRequirementsVersion(jobId);
            // 2. Mark existing matches as STALE (remain readable by recruiter)
            await MatchingRepository.markMatchesStaleForJob(jobId);
            // 3. Enqueue targeted background calculation
            await MatchingQueueService.addMatchForJobTask(jobId, newVersion);
            logger.info({
                event: "JOB_MATCHING_EVENT_PUBLISHED",
                jobId,
                newVersion,
                fields: fieldNames
            }, `[MatchingEvents] Triggered matching recalculation for job "${jobId}" (v${newVersion})`);
            return true;
        }
        catch (error) {
            logger.error({
                err: error,
                jobId,
                fields: fieldNames
            }, `[MatchingEvents] Failed to publish matching event for job "${jobId}"`);
            return false;
        }
    }
}
//# sourceMappingURL=matching-events.publisher.js.map