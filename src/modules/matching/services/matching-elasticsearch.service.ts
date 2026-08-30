import elasticsearchClient from "../../../config/elasticsearch.js";
import { logger } from "../../../common/logger/logger.js";
import {
    ES_MATCHING_INDICES,
    ES_CANDIDATE_MAPPINGS,
    ES_JOB_MAPPINGS,
    MATCHING_THRESHOLDS
} from "../constants/matching.constants.js";
import type {
    CandidateMatchingProfile,
    JobMatchingRequirements
} from "../interfaces/matching.interface.js";

export class MatchingElasticsearchService {
    public static async ensureIndices(): Promise<void> {
        try {
            // Candidate Index
            const candExists = await elasticsearchClient.indices.exists({
                index: ES_MATCHING_INDICES.CANDIDATES
            });
            if (!candExists) {
                await elasticsearchClient.indices.create({
                    index: ES_MATCHING_INDICES.CANDIDATES,
                    settings: {
                        number_of_shards: 1,
                        number_of_replicas: 1
                    } as any,
                    mappings: ES_CANDIDATE_MAPPINGS as any
                });
                logger.info(`[MatchingES] Index "${ES_MATCHING_INDICES.CANDIDATES}" created successfully.`);
            }

            // Job Index
            const jobExists = await elasticsearchClient.indices.exists({
                index: ES_MATCHING_INDICES.JOBS
            });
            if (!jobExists) {
                await elasticsearchClient.indices.create({
                    index: ES_MATCHING_INDICES.JOBS,
                    settings: {
                        number_of_shards: 1,
                        number_of_replicas: 1
                    } as any,
                    mappings: ES_JOB_MAPPINGS as any
                });
                logger.info(`[MatchingES] Index "${ES_MATCHING_INDICES.JOBS}" created successfully.`);
            }
        } catch (error) {
            logger.warn({ err: error }, "[MatchingES] Could not ensure matching ES indices. Will fallback to SQL filtering.");
        }
    }

    /**
     * Index or update a candidate in Elasticsearch
     */
    public static async indexCandidate(candidate: CandidateMatchingProfile): Promise<void> {
        try {
            const skillNames = candidate.skills.map((s) => s.name);
            await elasticsearchClient.index({
                index: ES_MATCHING_INDICES.CANDIDATES,
                id: candidate.id,
                document: {
                    id: candidate.id,
                    userId: candidate.userId,
                    fullName: candidate.fullName,
                    headline: candidate.headline,
                    currentDesignation: candidate.currentDesignation,
                    totalExperience: candidate.totalExperience,
                    experienceLevel: candidate.experienceLevel,
                    currentLocation: candidate.currentLocation,
                    preferredLocation: candidate.preferredLocation,
                    isOpenToWork: candidate.isOpenToWork,
                    skills: skillNames,
                    skillText: skillNames.join(" "),
                    educationDegrees: candidate.educationDegrees.join(" "),
                    certifications: candidate.certificationNames.join(" "),
                    profileVersion: candidate.profileVersion,
                    updatedAt: candidate.updatedAt
                }
            });
        } catch (error) {
            logger.warn({ err: error, candidateId: candidate.id }, "[MatchingES] Failed to index candidate into ES.");
        }
    }

    /**
     * Index or update a job in Elasticsearch
     */
    public static async indexJob(job: JobMatchingRequirements): Promise<void> {
        try {
            const skillNames = job.skills.map((s) => s.name);
            await elasticsearchClient.index({
                index: ES_MATCHING_INDICES.JOBS,
                id: job.id,
                document: {
                    id: job.id,
                    companyId: job.companyId,
                    title: job.title,
                    summary: job.summary,
                    description: job.description,
                    employmentType: job.employmentType,
                    workplaceType: job.workplaceType,
                    location: job.location,
                    minExperience: job.minExperience,
                    maxExperience: job.maxExperience,
                    status: job.status,
                    skills: skillNames,
                    skillText: skillNames.join(" "),
                    requirementsVersion: job.requirementsVersion,
                    updatedAt: job.updatedAt
                }
            });
        } catch (error) {
            logger.warn({ err: error, jobId: job.id }, "[MatchingES] Failed to index job into ES.");
        }
    }

    /**
     * Query potentially matching candidate IDs for a given job requirements payload.
     * Narrow down candidates using skill overlap, experience ranges, and open-to-work flags.
     */
    public static async findCandidateIdsForJob(
        job: JobMatchingRequirements,
        limit = MATCHING_THRESHOLDS.MAX_CANDIDATES_RETRIEVAL_LIMIT
    ): Promise<string[]> {
        try {
            const skillKeywords = job.skills.map((s) => s.name);

            const shouldClauses: any[] = [];

            if (skillKeywords.length > 0) {
                shouldClauses.push({
                    terms: { skills: skillKeywords.map(s => s.toLowerCase()) }
                });
                shouldClauses.push({
                    match: { skillText: { query: skillKeywords.join(" "), boost: 2.0 } }
                });
            }

            if (job.title) {
                shouldClauses.push({
                    match: { currentDesignation: { query: job.title, boost: 1.5 } }
                });
                shouldClauses.push({
                    match: { headline: { query: job.title, boost: 1.2 } }
                });
            }

            if (job.location && job.workplaceType !== "REMOTE") {
                shouldClauses.push({
                    match: { currentLocation: { query: job.location, boost: 1.0 } }
                });
            }

            const mustClauses: any[] = [
                { term: { isOpenToWork: true } }
            ];

            const response = await elasticsearchClient.search({
                index: ES_MATCHING_INDICES.CANDIDATES,
                size: limit,
                query: {
                    bool: {
                        must: mustClauses,
                        should: shouldClauses.length > 0 ? shouldClauses : [{ match_all: {} }],
                        minimum_should_match: shouldClauses.length > 0 ? 1 : 0
                    }
                }
            });

            const hits = response.hits?.hits || [];
            return hits.map((hit: any) => hit._id || hit._source?.id).filter(Boolean);
        } catch (error) {
            logger.warn({ err: error, jobId: job.id }, "[MatchingES] ES candidate search failed; returning empty for SQL fallback.");
            return [];
        }
    }

    /**
     * Query potentially matching job IDs for a given candidate profile.
     */
    public static async findJobIdsForCandidate(
        candidate: CandidateMatchingProfile,
        limit = MATCHING_THRESHOLDS.MAX_JOBS_RETRIEVAL_LIMIT
    ): Promise<string[]> {
        try {
            const skillKeywords = candidate.skills.map((s) => s.name);

            const shouldClauses: any[] = [];

            if (skillKeywords.length > 0) {
                shouldClauses.push({
                    terms: { skills: skillKeywords.map(s => s.toLowerCase()) }
                });
                shouldClauses.push({
                    match: { skillText: { query: skillKeywords.join(" "), boost: 2.0 } }
                });
            }

            if (candidate.currentDesignation || candidate.headline) {
                const roleQuery = `${candidate.currentDesignation || ""} ${candidate.headline || ""}`.trim();
                if (roleQuery) {
                    shouldClauses.push({
                        match: { title: { query: roleQuery, boost: 1.5 } }
                    });
                }
            }

            const mustClauses: any[] = [
                { term: { status: "PUBLISHED" } }
            ];

            const response = await elasticsearchClient.search({
                index: ES_MATCHING_INDICES.JOBS,
                size: limit,
                query: {
                    bool: {
                        must: mustClauses,
                        should: shouldClauses.length > 0 ? shouldClauses : [{ match_all: {} }],
                        minimum_should_match: shouldClauses.length > 0 ? 1 : 0
                    }
                }
            });

            const hits = response.hits?.hits || [];
            return hits.map((hit: any) => hit._id || hit._source?.id).filter(Boolean);
        } catch (error) {
            logger.warn({ err: error, candidateId: candidate.id }, "[MatchingES] ES job search failed; returning empty for SQL fallback.");
            return [];
        }
    }
}
