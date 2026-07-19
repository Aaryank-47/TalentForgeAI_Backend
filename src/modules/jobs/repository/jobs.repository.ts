import prisma from "../../../config/database.js";
import type { JobCreationDto, JobUpdateDto } from "../dto/jobs.dto.js";
import { JobSelect } from "../../../common/prisma.select/jobs.select.js"
import { toJobUpdateInput, toJobCreateInput } from "../mappers/job.mapper.js";

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
}

