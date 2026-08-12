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

export interface CreateJobInterviewData {
    jobId: string;
    interviewId: string;
    displayOrder: number;
    isMandatory: boolean;
}

export interface JobInterviewResponse {
    jobId: string;
    interviewId: string;
    displayOrder: number;
    isMandatory: boolean;
}

export interface JobInterviewWithInterviewResponse extends JobInterviewResponse {
    interview: {
        id: string;
        title: string;
        type: string;
        mode: string;
        durationMinutes: number | null;
        status: string;
    };
}

export interface RemoveJobInterviewResponse {
    jobId: string;
    interviewId: string;
}

export const jobInterviewWithInterviewSelect = {
    jobId: true,
    interviewId: true,
    displayOrder: true,
    isMandatory: true,
    interview: {
        select: {
            id: true,
            title: true,
            type: true,
            mode: true,
            durationMinutes: true,
            status: true,
        }
    }
} satisfies Prisma.JobInterviewSelect;

export type JobInterviewWithInterviewPayload = Prisma.JobInterviewGetPayload<{
    select: typeof jobInterviewWithInterviewSelect;
}>;

export const interviewAssignmentSelect = {
    id: true,
    interviewId: true,
    applicationId: true,
    creationSource: true,
    createdAt: true,
    application: {
        select: {
            id: true,
            status: true,
            candidate: {
                select: {
                    id: true,
                    fullName: true
                }
            },
            job: {
                select: {
                    id: true,
                    title: true
                }
            }
        }
    }
} satisfies Prisma.InterviewAssignmentSelect;

export type InterviewAssignmentPayload = Prisma.InterviewAssignmentGetPayload<{
    select: typeof interviewAssignmentSelect;
}>;

export type InterviewAssignmentResponse = Omit<InterviewAssignmentPayload, 'application'> & {
    application: {
        id: string;
        status: string;
        candidate: {
            id: string;
            fullName: string;
        };
        job: {
            id: string;
            title: string;
        };
    }
};

export const interviewAssignmentDetailSelect = {
    ...interviewAssignmentSelect,
    interview: {
        select: {
            id: true,
            title: true,
            type: true,
            mode: true,
            durationMinutes: true,
        }
    }
} satisfies Prisma.InterviewAssignmentSelect;

export type InterviewAssignmentDetailPayload = Prisma.InterviewAssignmentGetPayload<{
    select: typeof interviewAssignmentDetailSelect;
}>;

export type InterviewAssignmentDetailResponse = Omit<InterviewAssignmentDetailPayload, 'application'> & {
    application: {
        id: string;
        status: string;
        candidate: {
            id: string;
            fullName: string;
        };
        job: {
            id: string;
            title: string;
        };
    };
    interview: {
        id: string;
        title: string;
        type: string;
        mode: string;
        durationMinutes: number | null;
    }
};

export interface PaginatedInterviewAssignmentResponse {
    items: InterviewAssignmentResponse[];
    pagination: PaginationMeta;
}

