import prisma from "../../../config/database.js";
import type { JobCreationDto, JobUpdateDto } from "../dto/jobs.dto.js";
import { JobSelect } from "../../../common/prisma.select/jobs.select.js"
import { toJobUpdateInput, toJobCreateInput } from "../mappers/job.mapper.js";
import { JobStatus, Prisma } from "@prisma/client";
import type { JobMember } from "@prisma/client";

export class JobsRepository {
    static async createJob(
        companyId: string,
        jobCreationPayload: JobCreationDto,
        slug: string,
        createdById: string
    ): Promise<any> {
        return prisma.job.create({
            data: toJobCreateInput(companyId, jobCreationPayload, slug, createdById),
            select: JobSelect
        });
    }

    static async listCompanyJobs(
        companyId: string,
    ): Promise<any[]> {
        return prisma.job.findMany({
            where: {
                companyId: companyId,
            },
            select: JobSelect
        });
    }

    static async findJobById(
        jobId: string
    ): Promise<any> {
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

    static async updateJobDetails(
        jobId: string,
        jobPayload: JobUpdateDto,
    ): Promise<any> {
        return prisma.job.update({
            where: {
                id: jobId,
            },
            data: toJobUpdateInput(jobPayload),
            select: JobSelect
        })
    }

    static async updateJobStatus(
        jobId: string,
        status: JobStatus
    ): Promise<any> {
        return prisma.job.update({
            where: {
                id: jobId,
            },
            data: {
                status: status,
            },
            select: JobSelect
        })
    }

    static async assignRecruiterToJob(
        jobId: string,
        companyMemberId: string
    ): Promise<any> {
        return prisma.jobMember.create({
            data: {
                jobId,
                companyMemberId,
            },
        });
    }

    static async assignCompanyMemberToJob(
        jobId: string,
        companyMemberId: string,
        assignedBy: string
    ): Promise<JobMember> {
        return prisma.jobMember.create({
            data: {
                jobId,
                companyMemberId,
                assignedBy,
            },
        });
    }

    static async findJobAssignment(
        jobId: string,
        companyMemberId: string
    ): Promise<JobMember | null> {
        return prisma.jobMember.findUnique({
            where: {
                jobId_companyMemberId: {
                    jobId,
                    companyMemberId,
                },
            },
        });
    }

    static async listAssignedCompanyMembers(
        jobId: string
    ): Promise<any[]> {
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

    static async removeAssignedCompanyMember(
        jobId: string,
        companyMemberId: string
    ): Promise<JobMember> {
        return prisma.jobMember.delete({
            where: {
                jobId_companyMemberId: {
                    jobId,
                    companyMemberId,
                },
            },
        });
    }

    static async removeAssignedCompanyMembers(
        jobId: string,
        companyMemberIds: string[]
    ): Promise<Prisma.BatchPayload> {
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

