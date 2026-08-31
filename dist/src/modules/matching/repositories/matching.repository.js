import prisma from "../../../config/database.js";
import { JobStatus, MatchStatus } from "@prisma/client";
import { MATCHING_THRESHOLDS } from "../constants/matching.constants.js";
export class MatchingRepository {
    static async getCandidateMatchingProfile(candidateId) {
        const candidate = await prisma.candidate.findUnique({
            where: { id: candidateId },
            include: {
                skills: {
                    select: {
                        name: true,
                        yearsOfExperience: true,
                    }
                },
                educations: {
                    select: {
                        degree: true,
                        fieldOfStudy: true
                    }
                },
                certifications: {
                    select: {
                        name: true
                    }
                }
            }
        });
        if (!candidate)
            return null;
        return {
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
            profileVersion: candidate.profileVersion,
            skills: candidate.skills.map((s) => ({
                name: s.name,
                yearsOfExperience: s.yearsOfExperience
            })),
            educationDegrees: candidate.educations.map((e) => `${e.degree} in ${e.fieldOfStudy}`),
            certificationNames: candidate.certifications.map((c) => c.name),
            updatedAt: candidate.updatedAt
        };
    }
    /**
     * Retrieves full job matching requirements including required and preferred skills.
     */
    static async getJobMatchingRequirements(jobId) {
        const job = await prisma.job.findUnique({
            where: { id: jobId },
            include: {
                skills: {
                    select: {
                        name: true,
                        isRequired: true
                    }
                }
            }
        });
        if (!job)
            return null;
        return {
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
            requirementsVersion: job.requirementsVersion,
            skills: job.skills.map((s) => ({
                name: s.name,
                isRequired: s.isRequired
            })),
            updatedAt: job.updatedAt
        };
    }
    static async incrementCandidateProfileVersion(candidateId) {
        const updated = await prisma.candidate.update({
            where: { id: candidateId },
            data: {
                profileVersion: { increment: 1 }
            },
            select: { profileVersion: true }
        });
        return updated.profileVersion;
    }
    static async incrementJobRequirementsVersion(jobId) {
        const updated = await prisma.job.update({
            where: { id: jobId },
            data: {
                requirementsVersion: { increment: 1 }
            },
            select: { requirementsVersion: true }
        });
        return updated.requirementsVersion;
    }
    static async getCandidateProfilesByIds(candidateIds) {
        if (candidateIds.length === 0)
            return [];
        const candidates = await prisma.candidate.findMany({
            where: {
                id: { in: candidateIds },
                isOpenToWork: true
            },
            include: {
                skills: {
                    select: {
                        name: true,
                        yearsOfExperience: true
                    }
                },
                educations: {
                    select: {
                        degree: true,
                        fieldOfStudy: true
                    }
                },
                certifications: {
                    select: {
                        name: true
                    }
                }
            }
        });
        return candidates.map((candidate) => ({
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
            profileVersion: candidate.profileVersion,
            skills: candidate.skills.map((s) => ({
                name: s.name,
                yearsOfExperience: s.yearsOfExperience
            })),
            educationDegrees: candidate.educations.map((e) => `${e.degree} in ${e.fieldOfStudy}`),
            certificationNames: candidate.certifications.map((c) => c.name),
            updatedAt: candidate.updatedAt
        }));
    }
    static async getJobRequirementsByIds(jobIds) {
        if (jobIds.length === 0)
            return [];
        const jobs = await prisma.job.findMany({
            where: {
                id: { in: jobIds },
                status: JobStatus.PUBLISHED
            },
            include: {
                skills: {
                    select: {
                        name: true,
                        isRequired: true
                    }
                }
            }
        });
        return jobs.map((job) => ({
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
            requirementsVersion: job.requirementsVersion,
            skills: job.skills.map((s) => ({
                name: s.name,
                isRequired: s.isRequired
            })),
            updatedAt: job.updatedAt
        }));
    }
    /**
     * Targeted SQL fallback query for candidates matching a job.
     */
    static async findCandidateIdsForJobSql(job, limit = MATCHING_THRESHOLDS.MAX_CANDIDATES_RETRIEVAL_LIMIT) {
        const skillNames = job.skills.map((s) => s.name);
        let candidates = await prisma.candidate.findMany({
            where: {
                isOpenToWork: true,
                ...(skillNames.length > 0
                    ? {
                        skills: {
                            some: {
                                name: {
                                    in: skillNames,
                                    mode: "insensitive"
                                }
                            }
                        }
                    }
                    : {})
            },
            select: { id: true },
            take: limit
        });
        if (candidates.length === 0) {
            candidates = await prisma.candidate.findMany({
                where: { isOpenToWork: true },
                select: { id: true },
                take: limit
            });
        }
        return candidates.map((c) => c.id);
    }
    /**
     * Targeted SQL fallback query for jobs matching a candidate.
     */
    static async findJobIdsForCandidateSql(candidate, limit = MATCHING_THRESHOLDS.MAX_JOBS_RETRIEVAL_LIMIT) {
        const skillNames = candidate.skills.map((s) => s.name);
        let jobs = await prisma.job.findMany({
            where: {
                status: JobStatus.PUBLISHED,
                ...(skillNames.length > 0
                    ? {
                        skills: {
                            some: {
                                name: {
                                    in: skillNames,
                                    mode: "insensitive"
                                }
                            }
                        }
                    }
                    : {})
            },
            select: { id: true },
            take: limit
        });
        if (jobs.length === 0) {
            jobs = await prisma.job.findMany({
                where: { status: JobStatus.PUBLISHED },
                select: { id: true },
                take: limit
            });
        }
        return jobs.map((j) => j.id);
    }
    /**
     * Idempotently upsert a CandidateJobMatch record.
     */
    static async upsertMatch(result) {
        await prisma.candidateJobMatch.upsert({
            where: {
                candidateId_jobId: {
                    candidateId: result.candidateId,
                    jobId: result.jobId
                }
            },
            create: {
                candidateId: result.candidateId,
                jobId: result.jobId,
                matchScore: result.matchScore,
                deterministicScore: result.deterministicScore,
                semanticScore: result.semanticScore,
                matchingFactors: result.matchingFactors,
                status: result.status,
                candidateVersion: result.candidateVersion,
                jobVersion: result.jobVersion,
                calculatedAt: new Date()
            },
            update: {
                matchScore: result.matchScore,
                deterministicScore: result.deterministicScore,
                semanticScore: result.semanticScore,
                matchingFactors: result.matchingFactors,
                status: result.status,
                candidateVersion: result.candidateVersion,
                jobVersion: result.jobVersion,
                calculatedAt: new Date()
            }
        });
    }
    /**
     * Marks existing matches as STALE for a candidate when their profile changes.
     */
    static async markMatchesStaleForCandidate(candidateId) {
        await prisma.candidateJobMatch.updateMany({
            where: { candidateId },
            data: { status: MatchStatus.STALE }
        });
    }
    /**
     * Marks existing matches as STALE for a job when its requirements change.
     */
    static async markMatchesStaleForJob(jobId) {
        await prisma.candidateJobMatch.updateMany({
            where: { jobId },
            data: { status: MatchStatus.STALE }
        });
    }
    /**
     * Candidate-side read: Returns persisted ranked matched jobs.
     */
    static async findMatchesForCandidate(candidateId, options = {}) {
        const page = Math.max(1, options.page || 1);
        const limit = Math.min(100, Math.max(1, options.limit || 20));
        const minScore = options.minScore || MATCHING_THRESHOLDS.MINIMUM_PERSISTENCE_SCORE;
        const skip = (page - 1) * limit;
        const where = {
            candidateId,
            matchScore: { gte: minScore },
            job: {
                status: JobStatus.PUBLISHED
            }
        };
        const [total, records] = await Promise.all([
            prisma.candidateJobMatch.count({ where }),
            prisma.candidateJobMatch.findMany({
                where,
                include: {
                    job: {
                        include: {
                            company: {
                                select: {
                                    id: true,
                                    companyName: true,
                                    logo: true,
                                    industry: true,
                                    isVerified: true
                                }
                            },
                            skills: {
                                select: {
                                    id: true,
                                    name: true,
                                    isRequired: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    matchScore: "desc"
                },
                skip,
                take: limit
            })
        ]);
        const matches = records.map((r) => ({
            id: r.id,
            jobId: r.jobId,
            matchScore: r.matchScore,
            deterministicScore: r.deterministicScore,
            semanticScore: r.semanticScore,
            matchingFactors: r.matchingFactors,
            status: r.status,
            calculatedAt: r.calculatedAt.toISOString(),
            job: {
                id: r.job.id,
                title: r.job.title,
                slug: r.job.slug,
                summary: r.job.summary,
                employmentType: r.job.employmentType,
                workplaceType: r.job.workplaceType,
                location: r.job.location,
                minExperience: r.job.minExperience,
                maxExperience: r.job.maxExperience,
                minimumSalary: r.job.minimumSalary,
                maximumSalary: r.job.maximumSalary,
                salaryPeriod: r.job.salaryPeriod,
                publishedAt: r.job.publishedAt ? r.job.publishedAt.toISOString() : null,
                company: r.job.company,
                skills: r.job.skills
            }
        }));
        return { matches, total };
    }
    /**
     * Recruiter-side read: Returns persisted ranked matched candidates for a specific job.
     */
    static async findMatchesForJob(jobId, options = {}) {
        const page = Math.max(1, options.page || 1);
        const limit = Math.min(100, Math.max(1, options.limit || 20));
        const minScore = options.minScore || MATCHING_THRESHOLDS.MINIMUM_PERSISTENCE_SCORE;
        const skip = (page - 1) * limit;
        const where = {
            jobId,
            matchScore: { gte: minScore },
            candidate: {
                isOpenToWork: true
            }
        };
        const [total, records] = await Promise.all([
            prisma.candidateJobMatch.count({ where }),
            prisma.candidateJobMatch.findMany({
                where,
                include: {
                    candidate: {
                        include: {
                            skills: {
                                select: {
                                    id: true,
                                    name: true,
                                    yearsOfExperience: true
                                }
                            },
                            educations: {
                                select: {
                                    id: true,
                                    collegeName: true,
                                    degree: true,
                                    fieldOfStudy: true
                                }
                            },
                            experiences: {
                                select: {
                                    id: true,
                                    companyName: true,
                                    designation: true,
                                    startDate: true,
                                    endDate: true,
                                    currentlyWorking: true
                                },
                                orderBy: {
                                    startDate: "desc"
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    matchScore: "desc"
                },
                skip,
                take: limit
            })
        ]);
        const matches = records.map((r) => ({
            id: r.id,
            candidateId: r.candidateId,
            matchScore: r.matchScore,
            deterministicScore: r.deterministicScore,
            semanticScore: r.semanticScore,
            matchingFactors: r.matchingFactors,
            status: r.status,
            calculatedAt: r.calculatedAt.toISOString(),
            candidate: {
                id: r.candidate.id,
                fullName: r.candidate.fullName,
                headline: r.candidate.headline,
                profilePicture: r.candidate.profilePicture,
                currentDesignation: r.candidate.currentDesignation,
                currentCompany: r.candidate.currentCompany,
                totalExperience: r.candidate.totalExperience,
                experienceLevel: r.candidate.experienceLevel,
                currentLocation: r.candidate.currentLocation,
                preferredLocation: r.candidate.preferredLocation,
                isOpenToWork: r.candidate.isOpenToWork,
                skills: r.candidate.skills,
                educations: r.candidate.educations,
                experiences: r.candidate.experiences.map((exp) => ({
                    id: exp.id,
                    companyName: exp.companyName,
                    designation: exp.designation,
                    startDate: exp.startDate.toISOString(),
                    endDate: exp.endDate ? exp.endDate.toISOString() : null,
                    currentlyWorking: exp.currentlyWorking
                }))
            }
        }));
        return { matches, total };
    }
}
//# sourceMappingURL=matching.repository.js.map