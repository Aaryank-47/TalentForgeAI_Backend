import prisma from "../../../config/database.js";
import { JobSelect } from "../../../common/prisma.select/jobs.select.js";
import { toJobUpdateInput, toJobCreateInput } from "../mappers/job.mapper.js";
import { JobStatus, Prisma } from "@prisma/client";
export class JobsRepository {
    static async createJob(companyId, jobCreationPayload, slug, createdById) {
        return prisma.job.create({
            data: toJobCreateInput(companyId, jobCreationPayload, slug, createdById),
            select: JobSelect
        });
    }
    static async listCompanyJobs(companyId) {
        return prisma.job.findMany({
            where: {
                companyId: companyId,
            },
            select: JobSelect
        });
    }
    static async listPublishedJobs(params) {
        const where = {
            status: JobStatus.PUBLISHED,
        };
        if (params?.search) {
            where.OR = [
                { title: { contains: params.search, mode: "insensitive" } },
                { description: { contains: params.search, mode: "insensitive" } },
                { location: { contains: params.search, mode: "insensitive" } },
            ];
        }
        if (params?.employmentType) {
            where.employmentType = params.employmentType;
        }
        if (params?.workplaceType) {
            where.workplaceType = params.workplaceType;
        }
        if (params?.location) {
            where.location = { contains: params.location, mode: "insensitive" };
        }
        return prisma.job.findMany({
            where,
            include: {
                company: {
                    select: {
                        id: true,
                        companyName: true,
                        logo: true,
                        industry: true,
                        headquarters: true,
                        isVerified: true,
                    }
                },
                skills: true,
                benefits: true,
                _count: {
                    select: {
                        applications: true,
                    }
                }
            },
            orderBy: {
                publishedAt: "desc",
            }
        });
    }
    static async getPublicJobById(jobId) {
        return prisma.job.findFirst({
            where: {
                id: jobId,
                status: JobStatus.PUBLISHED,
            },
            include: {
                company: {
                    select: {
                        id: true,
                        companyName: true,
                        logo: true,
                        industry: true,
                        headquarters: true,
                        website: true,
                        description: true,
                        companySize: true,
                        isVerified: true,
                    }
                },
                skills: true,
                benefits: true,
                _count: {
                    select: {
                        applications: true,
                    }
                }
            }
        });
    }
    static async findJobById(jobId) {
        return prisma.job.findUnique({
            where: {
                id: jobId,
            },
            include: {
                skills: true,
                benefits: true,
                members: {
                    include: {
                        companyMember: {
                            include: {
                                user: true
                            }
                        }
                    }
                },
                workflow: {
                    include: {
                        stages: {
                            include: {
                                stageLibrary: true
                            }
                        }
                    }
                }
            }
        });
    }
    static async updateJobDetails(jobId, jobPayload) {
        return prisma.job.update({
            where: {
                id: jobId,
            },
            data: toJobUpdateInput(jobPayload),
            select: JobSelect
        });
    }
    static async updateJobStatus(jobId, status) {
        const updateData = {
            status: status,
        };
        if (status === JobStatus.PUBLISHED) {
            updateData.publishedAt = new Date();
        }
        else if (status === JobStatus.CLOSED) {
            updateData.closedAt = new Date();
        }
        else if (status === JobStatus.ARCHIVED) {
            updateData.archivedAt = new Date();
        }
        return prisma.job.update({
            where: {
                id: jobId,
            },
            data: updateData,
            select: JobSelect
        });
    }
    static async assignRecruiterToJob(jobId, companyMemberId) {
        return prisma.jobMember.create({
            data: {
                jobId,
                companyMemberId,
            },
        });
    }
    static async assignCompanyMemberToJob(jobId, companyMemberId, assignedBy) {
        return prisma.jobMember.create({
            data: {
                jobId,
                companyMemberId,
                assignedBy,
            },
        });
    }
    static async findJobAssignment(jobId, companyMemberId) {
        return prisma.jobMember.findUnique({
            where: {
                jobId_companyMemberId: {
                    jobId,
                    companyMemberId,
                },
            },
        });
    }
    static async listAssignedCompanyMembers(jobId) {
        return prisma.jobMember.findMany({
            where: {
                jobId,
            },
            include: {
                companyMember: {
                    include: {
                        user: {
                            include: {
                                employer: true,
                                candidate: true
                            }
                        }
                    }
                }
            }
        });
    }
    static async removeAssignedCompanyMember(jobId, companyMemberId) {
        return prisma.jobMember.delete({
            where: {
                jobId_companyMemberId: {
                    jobId,
                    companyMemberId,
                },
            },
        });
    }
    static async removeAssignedCompanyMembers(jobId, companyMemberIds) {
        return prisma.jobMember.deleteMany({
            where: {
                jobId: jobId,
                companyMemberId: {
                    in: companyMemberIds,
                },
            },
        });
    }
    static async saveJob(candidateId, jobId) {
        return prisma.savedJob.upsert({
            where: {
                candidateId_jobId: {
                    candidateId,
                    jobId,
                },
            },
            create: {
                candidateId,
                jobId,
            },
            update: {},
        });
    }
    static async unsaveJob(candidateId, jobId) {
        return prisma.savedJob.deleteMany({
            where: {
                candidateId,
                jobId,
            },
        });
    }
    static async getSavedJobs(candidateId) {
        return prisma.savedJob.findMany({
            where: {
                candidateId,
            },
            orderBy: {
                savedAt: 'desc',
            },
            include: {
                job: {
                    include: {
                        company: {
                            select: {
                                id: true,
                                companyName: true,
                                logo: true,
                                industry: true,
                                headquarters: true,
                                isVerified: true,
                            },
                        },
                        skills: {
                            select: {
                                id: true,
                                name: true,
                                isRequired: true,
                            },
                        },
                        benefits: {
                            select: {
                                id: true,
                                benefit: true,
                            },
                        },
                    },
                },
            },
        });
    }
    static async isJobSaved(candidateId, jobId) {
        const saved = await prisma.savedJob.findUnique({
            where: {
                candidateId_jobId: {
                    candidateId,
                    jobId,
                },
            },
            select: { id: true },
        });
        return !!saved;
    }
}
//# sourceMappingURL=jobs.repository.js.map