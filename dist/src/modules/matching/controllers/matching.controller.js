import { MatchingService } from "../services/matching.service.js";
import { MatchingEventsPublisher } from "../events/matching-events.publisher.js";
import { AuthRepository } from "../../auth/repositories/auth.repository.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
export class MatchingController {
    /**
     * Candidate-side: Get AI-matched jobs for current candidate.
     */
    static async getMatchedJobs(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            throw new NotFoundError("Authenticated user not found");
        }
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const minScore = req.query.minScore ? parseFloat(req.query.minScore) : undefined;
        const result = await MatchingService.getMatchedJobsForCandidate(userId, {
            page,
            limit,
            ...(minScore !== undefined ? { minScore } : {})
        });
        res.status(200).json({
            success: true,
            data: result.matches,
            meta: {
                total: result.total,
                page,
                limit
            }
        });
    }
    /**
     * Candidate-side: On-demand trigger to recalculate matching jobs.
     */
    static async recalculateCandidateMatches(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            throw new NotFoundError("Authenticated user not found");
        }
        const profile = await AuthRepository.findProfileByUserId(userId);
        if (!profile || !profile.profile || !("isOpenToWork" in profile.profile)) {
            throw new NotFoundError("Candidate profile not found");
        }
        const candidateId = profile.profile.id;
        await MatchingEventsPublisher.onCandidateMatchingDataChanged(candidateId, ["FORCE_RECALCULATE"]);
        res.status(202).json({
            success: true,
            message: "Candidate matching recalculation has been scheduled"
        });
    }
    /**
     * Recruiter-side: Get matched candidates for a specific job.
     */
    static async getMatchedCandidates(req, res) {
        const userId = req.user?.id;
        const jobId = req.params.jobId;
        const companyId = req.query.companyId;
        if (!userId) {
            throw new NotFoundError("Authenticated user not found");
        }
        if (!jobId) {
            throw new NotFoundError("Job ID parameter is required");
        }
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const minScore = req.query.minScore ? parseFloat(req.query.minScore) : undefined;
        const result = await MatchingService.getMatchedCandidatesForJob(jobId, userId, companyId, {
            page,
            limit,
            ...(minScore !== undefined ? { minScore } : {})
        });
        res.status(200).json({
            success: true,
            data: result.matches,
            meta: {
                total: result.total,
                page,
                limit
            }
        });
    }
    /**
     * Recruiter-side: On-demand trigger to recalculate candidates for a job.
     */
    static async recalculateJobMatches(req, res) {
        const jobId = req.params.jobId;
        if (!jobId) {
            throw new NotFoundError("Job ID parameter is required");
        }
        await MatchingEventsPublisher.onJobMatchingDataChanged(jobId, ["FORCE_RECALCULATE"]);
        res.status(202).json({
            success: true,
            message: `Matching recalculation for job "${jobId}" has been scheduled`
        });
    }
}
//# sourceMappingURL=matching.controller.js.map