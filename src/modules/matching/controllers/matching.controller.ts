import type { Request, Response } from "express";
import { MatchingService } from "../services/matching.service.js";
import { MatchingEventsPublisher } from "../events/matching-events.publisher.js";
import { AuthRepository } from "../../auth/repositories/auth.repository.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";

export class MatchingController {
    /**
     * Candidate-side: Get AI-matched jobs for current candidate.
     */
    public static async getMatchedJobs(req: Request, res: Response): Promise<void> {
        const userId = req.user?.id;
        if (!userId) {
            throw new NotFoundError("Authenticated user not found");
        }

        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 20;
        const minScore = req.query.minScore ? parseFloat(req.query.minScore as string) : undefined;

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
    public static async recalculateCandidateMatches(req: Request, res: Response): Promise<void> {
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
    public static async getMatchedCandidates(req: Request, res: Response): Promise<void> {
        const userId = req.user?.id;
        const jobId = req.params.jobId as string;
        const companyId = req.query.companyId as string | undefined;

        if (!userId) {
            throw new NotFoundError("Authenticated user not found");
        }
        if (!jobId) {
            throw new NotFoundError("Job ID parameter is required");
        }

        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 20;
        const minScore = req.query.minScore ? parseFloat(req.query.minScore as string) : undefined;

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
    public static async recalculateJobMatches(req: Request, res: Response): Promise<void> {
        const jobId = req.params.jobId as string;
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
