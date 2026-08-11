import type { Prisma } from "@prisma/client";
import type { PaginationMeta } from "../../../common/types/pagination.types.js";

export const interviewSelect = {
    id: true,
    companyId: true,
    title: true,
    description: true,
    instructions: true,
    type: true,
    mode: true,
    durationMinutes: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    createdBy: {
        select: {
            id: true,
            userId: true,
        },
    },
} satisfies Prisma.InterviewSelect;

export type InterviewResponse = Prisma.InterviewGetPayload<{
    select: typeof interviewSelect;
}>;

export const interviewListSelect = {
    id: true,
    title: true,
    type: true,
    mode: true,
    durationMinutes: true,
    status: true,
    createdAt: true,
} satisfies Prisma.InterviewSelect;

export type InterviewSummary = Prisma.InterviewGetPayload<{
    select: typeof interviewListSelect;
}>;

export const interviewDetailSelect = {
    id: true,
    companyId: true,
    title: true,
    description: true,
    instructions: true,
    type: true,
    mode: true,
    durationMinutes: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    createdBy: {
        select: {
            id: true,
            userId: true,
        },
    },
    jobInterviews: {
        select: {
            jobId: true,
            job: { select: { title: true } },
            displayOrder: true,
            isMandatory: true,
        }
    }
} satisfies Prisma.InterviewSelect;

export type InterviewDetailPayload = Prisma.InterviewGetPayload<{
    select: typeof interviewDetailSelect;
}>;

export interface InterviewDetailResponse extends Omit<InterviewDetailPayload, 'jobInterviews'> {
    jobs: {
        jobId: string;
        title: string;
        displayOrder: number;
        isMandatory: boolean;
    }[];
}

export interface PaginatedInterviewResponse {
    items: InterviewSummary[];
    pagination: PaginationMeta;
}

export interface ArchiveInterviewResponse {
    id: string;
    status: string;
}
