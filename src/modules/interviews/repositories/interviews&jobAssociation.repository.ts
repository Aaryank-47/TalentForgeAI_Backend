import type { CreateInterviewDto } from "../dto/interviews&jobAssociation.dto.js";
import prisma from "../../../config/database.js";
import type { Prisma } from "@prisma/client";
import {
    interviewSelect,
    type InterviewResponse,
    interviewListSelect,
    type InterviewSummary,
    interviewDetailSelect,
    type InterviewDetailPayload
} from "../interfaces/interviews&jobAssociation.interface.js";
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

    static async archiveInterview(
        companyId: string,
        interviewId: string
    ) {
        return prisma.interview.update({
            where: {
                id: interviewId,
                companyId
            },
            data: {
                status: "ARCHIVED"
            },
            select: {
                id: true,
                status: true
            }
        });
    }
}