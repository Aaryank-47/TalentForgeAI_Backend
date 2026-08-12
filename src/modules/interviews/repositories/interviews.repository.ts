import type { CreateInterviewDto } from "../dto/interviews.dto.js";
import prisma from "../../../config/database.js";
import type { Prisma, InterviewStatus } from "@prisma/client";
import {
    interviewSelect,
    type InterviewResponse,
    interviewListSelect,
    type InterviewSummary,
    interviewDetailSelect,
    type InterviewDetailPayload,
    type CreateJobInterviewData,
    type JobInterviewWithInterviewPayload,
    jobInterviewWithInterviewSelect
} from "../interfaces/interviews.interface.js";
import type { PaginationResult } from "../../../common/types/pagination.types.js";

export class InterviewsRepositories {
    static async createInterview(data: Prisma.InterviewCreateInput): Promise<InterviewResponse> {
        return prisma.interview.create({
            data,
            select: interviewSelect
        });
    }

    static async getCompanyInterviews(
        companyId: string,
        pagination: PaginationResult,
        filters: {
            status?: any,
            type?: any,
            mode?: any,
            search?: string
        }
    ): Promise<{
        data: InterviewSummary[],
        total: number
    }> {
        const where: Prisma.InterviewWhereInput = {
            companyId,
            ...(filters.status && { status: filters.status }),
            ...(filters.type && { type: filters.type }),
            ...(filters.mode && { mode: filters.mode }),
            ...(filters.search && {
                title: { contains: filters.search, mode: "insensitive" }
            })
        };

        const [data, total] = await Promise.all([
            prisma.interview.findMany({
                where,
                skip: pagination.skip,
                take: pagination.take,
                orderBy: { [pagination.sortBy]: pagination.sortOrder },
                select: interviewListSelect
            }),
            prisma.interview.count({ where })
        ]);

        return { data, total };
    }

    static async getInterviewById(companyId: string, interviewId: string): Promise<InterviewDetailPayload | null> {
        return prisma.interview.findUnique({
            where: {
                id: interviewId,
                companyId
            },
            select: interviewDetailSelect
        });
    }

    static async updateInterview(
        companyId: string,
        interviewId: string,
        data: Prisma.InterviewUpdateInput
    ): Promise<InterviewResponse> {
        return prisma.interview.update({
            where: {
                id: interviewId,
                companyId
            },
            data,
            select: interviewSelect
        });
    }

    static async changeInterviewStatus(
        companyId: string,
        interviewId: string,
        status: InterviewStatus
    ) {
        return prisma.interview.update({
            where: {
                id: interviewId,
                companyId
            },
            data: {
                status
            },
            select: {
                id: true,
                status: true
            }
        });
    }
}

export class JobInterviewsRepositories {
    static async createJobInterview(data: CreateJobInterviewData) {
        return prisma.jobInterview.create({
            data
        });
    }

    static async findJobInterviews(jobId: string): Promise<JobInterviewWithInterviewPayload[]> {
        return prisma.jobInterview.findMany({
            where: { jobId },
            orderBy: { displayOrder: 'asc' },
            select: jobInterviewWithInterviewSelect
        });
    }

    static async findAllJobInterviews() {
        return prisma.jobInterview.findMany({
            include: { interview: true }
        });
    }

    static async findJobInterview(jobId: string, interviewId: string) {
        return prisma.jobInterview.findUnique({
            where: {
                jobId_interviewId: {
                    jobId,
                    interviewId
                }
            }
        });
    }

    static async findLastJobInterview(jobId: string) {
        return prisma.jobInterview.findFirst({
            where: { jobId },
            orderBy: { displayOrder: 'desc' }
        });
    }

    static async deleteJobInterview(jobId: string, interviewId: string) {
        return prisma.jobInterview.delete({
            where: {
                jobId_interviewId: {
                    jobId,
                    interviewId
                }
            }
        });
    }

    static async deleteAllJobInterviewsByInterviewId(interviewId: string) {
        return prisma.jobInterview.deleteMany({
            where: {
                interviewId
            }
        });
    }

    static async updateJobInterviewOrders(
        jobId: string,
        orders: { interviewId: string; displayOrder: number }[]
    ) {
        return prisma.$transaction(
            orders.map(order =>
                prisma.jobInterview.update({
                    where: {
                        jobId_interviewId: {
                            jobId,
                            interviewId: order.interviewId
                        }
                    },
                    data: {
                        displayOrder: order.displayOrder
                    }
                })
            )
        );
    }
}