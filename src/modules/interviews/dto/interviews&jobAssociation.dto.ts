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