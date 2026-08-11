import { z } from "zod"
import {
    interviewTitleValidator,
    interviewDescriptionValidator,
    interviewInstructionsValidator,
    interviewTypeValidator,
    interviewModeValidator,
    interviewDurationMinutesValidator,
    aiInterviewSystemPromptValidator,
    aiInterviewEvaluationMetricsValidator
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