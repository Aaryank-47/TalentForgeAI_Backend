import { z } from "zod"
import {
    interviewTitleValidator,
    interviewDescriptionValidator,
    interviewInstructionsValidator,
    interviewTypeValidator,
    interviewModeValidator,
    interviewDurationMinutesValidator,
    aiInterviewSystemPromptValidator,
    aiInterviewEvaluationMetricsValidator,
    interviewStatusValidator
} from "../../../common/validators/validators.js"

export const createInterviewDto = z.object({
    title: interviewTitleValidator,
    description: interviewDescriptionValidator.optional(),
    instructions: interviewInstructionsValidator.optional(),
    type: interviewTypeValidator,
    mode: interviewModeValidator,
    durationMinutes: interviewDurationMinutesValidator.optional(),
    aiConfiguration: z.object({
        systemPrompt: aiInterviewSystemPromptValidator,
        evaluationMetrics: aiInterviewEvaluationMetricsValidator
    }).optional()
})

export type CreateInterviewDto = z.infer<typeof createInterviewDto>;

export const interviewListQueryDto = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    status: interviewStatusValidator.optional(),
    type: interviewTypeValidator.optional(),
    mode: interviewModeValidator.optional(),
    search: z.string().optional(),
});

export type InterviewListQueryDto = z.infer<typeof interviewListQueryDto>;

export const updateInterviewDto = z.object({
    title: interviewTitleValidator.optional(),
    description: interviewDescriptionValidator.optional().nullable(),
    instructions: interviewInstructionsValidator.optional().nullable(),
    type: interviewTypeValidator.optional(),
    mode: interviewModeValidator.optional(),
    durationMinutes: interviewDurationMinutesValidator.optional(),
    aiConfiguration: z.object({
        systemPrompt: aiInterviewSystemPromptValidator,
        evaluationMetrics: aiInterviewEvaluationMetricsValidator
    }).optional()
});

export type UpdateInterviewDto = z.infer<typeof updateInterviewDto>;

export const changeInterviewStatusDto = z.object({
    status: interviewStatusValidator
});

export type ChangeInterviewStatusDto = z.infer<typeof changeInterviewStatusDto>;

export const attachInterviewToJobDto = z.object({
    interviewId: z.string().cuid({ message: "Invalid interview ID" }),
    displayOrder: z.number().int().min(1).optional(),
    isMandatory: z.boolean().optional()
});

export type AttachInterviewToJobRequest = z.infer<typeof attachInterviewToJobDto>;

export const reorderJobInterviewsDto = z.object({
    interviews: z.array(
        z.object({
            interviewId: z.string().cuid({ message: "Invalid interview ID" }),
            displayOrder: z.number().int().min(1)
        })
    ).min(1, { message: "At least one interview must be provided for reordering" })
});

export type ReorderJobInterviewsRequest = z.infer<typeof reorderJobInterviewsDto>;

export const createInterviewAssignmentsDto = z.object({
    applicationIds: z.array(z.string().cuid({ message: "Invalid application ID" }))
        .min(1, { message: "At least one application ID must be provided" })
        .refine((ids) => new Set(ids).size === ids.length, {
            message: "Duplicate application IDs are not allowed",
        }),
});

export type CreateInterviewAssignmentsRequest = z.infer<typeof createInterviewAssignmentsDto>;

export const getInterviewAssignmentsQueryDto = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
});

export type GetInterviewAssignmentsQueryDto = z.infer<typeof getInterviewAssignmentsQueryDto>;

export const createInterviewSessionDto = z.object({
    scheduledAt: z.string().datetime({ message: "Invalid ISO datetime string" }).refine(val => new Date(val) > new Date(), { message: "scheduledAt must be in the future" }),
    assignmentIds: z.array(z.string().cuid({ message: "Invalid assignment ID" })).optional(),
    companyMemberIds: z.array(z.string().cuid({ message: "Invalid company member ID" })).optional()
});

export type CreateInterviewSessionRequest = z.infer<typeof createInterviewSessionDto>;

export const updateInterviewSessionDto = z.object({
    scheduledAt: z.string().datetime({ message: "Invalid ISO datetime string" }).refine(val => new Date(val) > new Date(), { message: "scheduledAt must be in the future" }).optional()
});

export type UpdateInterviewSessionRequest = z.infer<typeof updateInterviewSessionDto>;

export const addSessionParticipantsDto = z.object({
    assignmentIds: z.array(z.string().cuid({ message: "Invalid assignment ID" })).optional(),
    companyMemberIds: z.array(z.string().cuid({ message: "Invalid company member ID" })).optional()
}).refine(data => {
    const hasAssignments = data.assignmentIds && data.assignmentIds.length > 0;
    const hasMembers = data.companyMemberIds && data.companyMemberIds.length > 0;
    return hasAssignments || hasMembers;
}, { message: "At least one assignmentId or companyMemberId must be provided" });

export type AddSessionParticipantsRequest = z.infer<typeof addSessionParticipantsDto>;