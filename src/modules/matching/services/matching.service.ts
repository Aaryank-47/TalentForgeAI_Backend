import { logger } from "../../../common/logger/logger.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ForbiddenError } from "../../../common/errors/ForbiddenError.js";
import { MatchingRepository } from "../repositories/matching.repository.js";
import { MatchingScorerService } from "./matching-scorer.service.js";
import { MatchingRetrievalService } from "./matching-retrieval.service.js";
import { MatchingElasticsearchService } from "./matching-elasticsearch.service.js";
import { MATCHING_THRESHOLDS } from "../constants/matching.constants.js";
import type {
    MatchCalculationResult,
    MatchingMetrics,
    CandidateMatchedJobView,
    RecruiterMatchedCandidateView,
    SemanticScoreResult
} from "../interfaces/matching.interface.js";
import { AuthRepository } from "../../auth/repositories/auth.repository.js";
import { CompanyRepository } from "../../company/repository/company.repository.js";

export class MatchingService {
    public static async matchForJob(jobId: string): Promise<MatchingMetrics> {
        const startTime = performance.now();

        const job = await MatchingRepository.getJobMatchingRequirements(jobId);
        if (!job) {
            throw new NotFoundError(`Job with ID "${jobId}" not found for matching`);
        }

        await MatchingElasticsearchService.indexJob(job);

        const candidates = await MatchingRetrievalService.retrieveCandidatesForJob(job);

        logger.info(
            {
                event: "JOB_MATCHING_CANDIDATES_RETRIEVED",
                jobId,
                count: candidates.length,
                requirementsVersion: job.requirementsVersion
            },
            `[MatchingService] Retrieved ${candidates.length} candidate(s) for job "${job.title}" (${jobId})`
        );

        if (candidates.length === 0) {
            return {
                jobId,
                candidatesRetrieved: 0,
                deterministicEvaluated: 0,
                aiEvaluated: 0,
                matchesPersisted: 0,
                durationMs: Math.round(performance.now() - startTime)
            };
        }

        // LEVEL 1: Deterministic scoring for all retrieved candidates
        const evaluatedPairs: Array<{
            candidate: typeof candidates[0];
            deterministicScore: number;
            factors: any;
        }> = [];

        for (const candidate of candidates) {
            const deterministicResult = MatchingScorerService.calculateDeterministicScore(candidate, job);
            evaluatedPairs.push({
                candidate,
                deterministicScore: deterministicResult.score,
                factors: deterministicResult.factors
            });
        }

        // Shortlist candidates for LEVEL 2 (Semantic / AI)
        // Sort descending by deterministic score
        evaluatedPairs.sort((a, b) => b.deterministicScore - a.deterministicScore);

        const aiEligible = evaluatedPairs
            .filter((p) => p.deterministicScore >= MATCHING_THRESHOLDS.SEMANTIC_SCORING_MIN_THRESHOLD)
            .slice(0, MATCHING_THRESHOLDS.MAX_SEMANTIC_EVALUATIONS);

        const aiScoreMap = new Map<string, SemanticScoreResult>();

        for (const eligible of aiEligible) {
            const semanticResult = await MatchingScorerService.calculateSemanticScore(
                eligible.candidate,
                job,
                eligible.deterministicScore
            );
            aiScoreMap.set(eligible.candidate.id, semanticResult);
        }

        // Persist calculated matches idempotently
        let persistedCount = 0;
        for (const pair of evaluatedPairs) {
            const semanticResult = aiScoreMap.get(pair.candidate.id) || null;
            const finalScore = MatchingScorerService.blendFinalScore(
                pair.deterministicScore,
                semanticResult
            );

            // Filter out noise below minimal viable score
            if (finalScore >= MATCHING_THRESHOLDS.MINIMUM_PERSISTENCE_SCORE) {
                const matchRecord: MatchCalculationResult = {
                    candidateId: pair.candidate.id,
                    jobId: job.id,
                    matchScore: finalScore,
                    deterministicScore: pair.deterministicScore,
                    semanticScore: semanticResult?.usedAI ? semanticResult.score : null,
                    matchingFactors: pair.factors,
                    candidateVersion: pair.candidate.profileVersion,
                    jobVersion: job.requirementsVersion,
                    status: "CURRENT"
                };

                await MatchingRepository.upsertMatch(matchRecord);
                persistedCount++;
            }
        }

        const durationMs = Math.round(performance.now() - startTime);

        const metrics: MatchingMetrics = {
            jobId,
            candidatesRetrieved: candidates.length,
            deterministicEvaluated: evaluatedPairs.length,
            aiEvaluated: aiScoreMap.size,
            matchesPersisted: persistedCount,
            durationMs
        };

        logger.info(
            {
                event: "JOB_MATCHING_COMPLETED",
                ...metrics
            },
            `[MatchingService] Completed matching for job "${jobId}" in ${durationMs}ms: ${persistedCount} matches persisted (${aiScoreMap.size} AI evaluated)`
        );

        return metrics;
    }

    /**
     * Executes targeted matching for a single Candidate against relevant jobs.
     */
    public static async matchForCandidate(candidateId: string): Promise<MatchingMetrics> {
        const startTime = performance.now();

        // Fetch authoritative candidate profile from database
        const candidate = await MatchingRepository.getCandidateMatchingProfile(candidateId);
        if (!candidate) {
            throw new NotFoundError(`Candidate with ID "${candidateId}" not found for matching`);
        }

        // Synchronize candidate to Elasticsearch in background
        await MatchingElasticsearchService.indexCandidate(candidate);

        // 2. Retrieve targeted published jobs pool via Elasticsearch + DB fallback
        const jobs = await MatchingRetrievalService.retrieveJobsForCandidate(candidate);

        logger.info(
            {
                event: "CANDIDATE_MATCHING_JOBS_RETRIEVED",
                candidateId,
                count: jobs.length,
                profileVersion: candidate.profileVersion
            },
            `[MatchingService] Retrieved ${jobs.length} job(s) for candidate "${candidate.fullName}" (${candidateId})`
        );

        if (jobs.length === 0) {
            return {
                candidateId,
                jobsRetrieved: 0,
                deterministicEvaluated: 0,
                aiEvaluated: 0,
                matchesPersisted: 0,
                durationMs: Math.round(performance.now() - startTime)
            };
        }

        // 3. LEVEL 1: Deterministic scoring for all retrieved jobs
        const evaluatedPairs: Array<{
            job: typeof jobs[0];
            deterministicScore: number;
            factors: any;
        }> = [];

        for (const job of jobs) {
            const deterministicResult = MatchingScorerService.calculateDeterministicScore(candidate, job);
            evaluatedPairs.push({
                job,
                deterministicScore: deterministicResult.score,
                factors: deterministicResult.factors
            });
        }

        // 4. Shortlist jobs for LEVEL 2 (Semantic / AI)
        evaluatedPairs.sort((a, b) => b.deterministicScore - a.deterministicScore);

        const aiEligible = evaluatedPairs
            .filter((p) => p.deterministicScore >= MATCHING_THRESHOLDS.SEMANTIC_SCORING_MIN_THRESHOLD)
            .slice(0, MATCHING_THRESHOLDS.MAX_SEMANTIC_EVALUATIONS);

        const aiScoreMap = new Map<string, SemanticScoreResult>();

        for (const eligible of aiEligible) {
            const semanticResult = await MatchingScorerService.calculateSemanticScore(
                candidate,
                eligible.job,
                eligible.deterministicScore
            );
            aiScoreMap.set(eligible.job.id, semanticResult);
        }

        // 5. Persist calculated matches idempotently
        let persistedCount = 0;
        for (const pair of evaluatedPairs) {
            const semanticResult = aiScoreMap.get(pair.job.id) || null;
            const finalScore = MatchingScorerService.blendFinalScore(
                pair.deterministicScore,
                semanticResult
            );

            if (finalScore >= MATCHING_THRESHOLDS.MINIMUM_PERSISTENCE_SCORE) {
                const matchRecord: MatchCalculationResult = {
                    candidateId: candidate.id,
                    jobId: pair.job.id,
                    matchScore: finalScore,
                    deterministicScore: pair.deterministicScore,
                    semanticScore: semanticResult?.usedAI ? semanticResult.score : null,
                    matchingFactors: pair.factors,
                    candidateVersion: candidate.profileVersion,
                    jobVersion: pair.job.requirementsVersion,
                    status: "CURRENT"
                };

                await MatchingRepository.upsertMatch(matchRecord);
                persistedCount++;
            }
        }

        const durationMs = Math.round(performance.now() - startTime);

        const metrics: MatchingMetrics = {
            candidateId,
            jobsRetrieved: jobs.length,
            deterministicEvaluated: evaluatedPairs.length,
            aiEvaluated: aiScoreMap.size,
            matchesPersisted: persistedCount,
            durationMs
        };

        logger.info(
            {
                event: "CANDIDATE_MATCHING_COMPLETED",
                ...metrics
            },
            `[MatchingService] Completed matching for candidate "${candidateId}" in ${durationMs}ms: ${persistedCount} matches persisted (${aiScoreMap.size} AI evaluated)`
        );

        return metrics;
    }

    /**
     * Targeted recalculation of a single candidate-job pair.
     */
    public static async recalculatePair(candidateId: string, jobId: string): Promise<MatchCalculationResult> {
        const [candidate, job] = await Promise.all([
            MatchingRepository.getCandidateMatchingProfile(candidateId),
            MatchingRepository.getJobMatchingRequirements(jobId)
        ]);

        if (!candidate) throw new NotFoundError(`Candidate "${candidateId}" not found`);
        if (!job) throw new NotFoundError(`Job "${jobId}" not found`);

        const deterministicResult = MatchingScorerService.calculateDeterministicScore(candidate, job);
        let semanticResult: SemanticScoreResult | null = null;

        if (deterministicResult.score >= MATCHING_THRESHOLDS.SEMANTIC_SCORING_MIN_THRESHOLD) {
            semanticResult = await MatchingScorerService.calculateSemanticScore(
                candidate,
                job,
                deterministicResult.score
            );
        }

        const finalScore = MatchingScorerService.blendFinalScore(
            deterministicResult.score,
            semanticResult
        );

        const matchRecord: MatchCalculationResult = {
            candidateId,
            jobId,
            matchScore: finalScore,
            deterministicScore: deterministicResult.score,
            semanticScore: semanticResult?.usedAI ? semanticResult.score : null,
            matchingFactors: deterministicResult.factors,
            candidateVersion: candidate.profileVersion,
            jobVersion: job.requirementsVersion,
            status: "CURRENT"
        };

        await MatchingRepository.upsertMatch(matchRecord);
        return matchRecord;
    }

    /**
     * Candidate-side query: reads persisted matched jobs for candidate.
     */
    public static async getMatchedJobsForCandidate(
        userId: string,
        options: { page?: number; limit?: number; minScore?: number } = {}
    ): Promise<{ matches: CandidateMatchedJobView[]; total: number }> {
        const profile = await AuthRepository.findProfileByUserId(userId);
        if (!profile || !profile.profile || !('isOpenToWork' in profile.profile)) {
            throw new NotFoundError("Candidate profile not found");
        }

        const candidateId = profile.profile.id;
        let result = await MatchingRepository.findMatchesForCandidate(candidateId, options);
        if (result.total === 0) {
            await this.matchForCandidate(candidateId);
            result = await MatchingRepository.findMatchesForCandidate(candidateId, options);
        }
        return result;
    }

    /**
     * Recruiter-side query: reads persisted matched candidates for a specific job.
     */
    public static async getMatchedCandidatesForJob(
        jobId: string,
        userId: string,
        companyId?: string,
        options: { page?: number; limit?: number; minScore?: number } = {}
    ): Promise<{ matches: RecruiterMatchedCandidateView[]; total: number }> {
        const job = await MatchingRepository.getJobMatchingRequirements(jobId);
        if (!job) {
            throw new NotFoundError("Job not found");
        }

        // Verify company authorization if companyId provided or verify user membership
        if (companyId && job.companyId !== companyId) {
            throw new ForbiddenError("Job does not belong to this company");
        }

        const membership = await CompanyRepository.findMemberByUserAndCompany(userId, job.companyId);
        if (!membership) {
            throw new ForbiddenError("User is not an authorized member of the company owning this job");
        }

        let result = await MatchingRepository.findMatchesForJob(jobId, options);
        if (result.total === 0) {
            await this.matchForJob(jobId);
            result = await MatchingRepository.findMatchesForJob(jobId, options);
        }
        return result;
    }
}
