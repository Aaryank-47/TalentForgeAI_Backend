import type { Prisma } from "@prisma/client";

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
