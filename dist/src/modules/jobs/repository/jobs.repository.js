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
        return prisma.job.update({
            where: {
                id: jobId,
            },
            data: {
                status: status,
            },
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
}
//# sourceMappingURL=jobs.repository.js.map