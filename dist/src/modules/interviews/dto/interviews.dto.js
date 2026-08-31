import { z } from "zod";
import { interviewTitleValidator, interviewDescriptionValidator, interviewInstructionsValidator, interviewTypeValidator, interviewModeValidator, interviewDurationMinutesValidator, aiInterviewSystemPromptValidator, aiInterviewEvaluationMetricsValidator, aiInterviewQuestionCountValidator, aiInterviewDifficultyValidator, aiInterviewAllowFollowUpsValidator, interviewStatusValidator, interviewEvaluationOverallScoreValidator, interviewEvaluationScoreValidator, interviewEvaluationRecommendationValidator, interviewEvaluationStrengthsValidator, interviewEvaluationImprovementsValidator, interviewEvaluationCommentsValidator } from "../../../common/validators/validators.js";
export const createInterviewDto = z.object({
    title: interviewTitleValidator,
    description: interviewDescriptionValidator.optional(),
    instructions: interviewInstructionsValidator.optional(),
    type: interviewTypeValidator,
    mode: interviewModeValidator,
    status: interviewStatusValidator.optional(),
    durationMinutes: interviewDurationMinutesValidator.optional(),
    aiConfiguration: z.object({
        systemPrompt: aiInterviewSystemPromptValidator,
        evaluationMetrics: aiInterviewEvaluationMetricsValidator,
        questionCount: aiInterviewQuestionCountValidator,
        difficulty: aiInterviewDifficultyValidator,
        allowFollowUps: aiInterviewAllowFollowUpsValidator,
    }).optional()
});
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
export const updateInterviewDto = z.object({
    title: interviewTitleValidator.optional(),
    description: interviewDescriptionValidator.optional().nullable(),
    instructions: interviewInstructionsValidator.optional().nullable(),
    type: interviewTypeValidator.optional(),
    mode: interviewModeValidator.optional(),
    status: interviewStatusValidator.optional(),
    durationMinutes: interviewDurationMinutesValidator.optional(),
    aiConfiguration: z.object({
        systemPrompt: aiInterviewSystemPromptValidator,
        evaluationMetrics: aiInterviewEvaluationMetricsValidator,
        questionCount: aiInterviewQuestionCountValidator,
        difficulty: aiInterviewDifficultyValidator,
        allowFollowUps: aiInterviewAllowFollowUpsValidator,
    }).optional()
});
export const changeInterviewStatusDto = z.object({
    status: interviewStatusValidator
});
export const attachInterviewToJobDto = z.object({
    interviewId: z.string().cuid({ message: "Invalid interview ID" }),
    displayOrder: z.number().int().min(1).optional(),
    isMandatory: z.boolean().optional()
});
export const reorderJobInterviewsDto = z.object({
    interviews: z.array(z.object({
        interviewId: z.string().cuid({ message: "Invalid interview ID" }),
        displayOrder: z.number().int().min(1)
    })).min(1, { message: "At least one interview must be provided for reordering" })
});
export const createInterviewAssignmentsDto = z.object({
    applicationIds: z.array(z.string().cuid({ message: "Invalid application ID" }))
        .min(1, { message: "At least one application ID must be provided" })
        .refine((ids) => new Set(ids).size === ids.length, {
        message: "Duplicate application IDs are not allowed",
    }),
});
export const getInterviewAssignmentsQueryDto = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
});
export const createInterviewSessionDto = z.object({
    scheduledAt: z.string().datetime({ message: "Invalid ISO datetime string" }).refine(val => new Date(val) > new Date(), { message: "scheduledAt must be in the future" }),
    assignmentIds: z.array(z.string().cuid({ message: "Invalid assignment ID" })).optional(),
    applicationIds: z.array(z.string().cuid({ message: "Invalid application ID" })).optional(),
    companyMemberIds: z.array(z.string().cuid({ message: "Invalid company member ID" })).optional()
});
export const updateInterviewSessionDto = z.object({
    scheduledAt: z.string().datetime({ message: "Invalid ISO datetime string" }).refine(val => new Date(val) > new Date(), { message: "scheduledAt must be in the future" }).optional()
});
export const addSessionParticipantsDto = z.object({
    assignmentIds: z.array(z.string().cuid({ message: "Invalid assignment ID" })).optional(),
    companyMemberIds: z.array(z.string().cuid({ message: "Invalid company member ID" })).optional()
}).refine(data => {
    const hasAssignments = data.assignmentIds && data.assignmentIds.length > 0;
    const hasMembers = data.companyMemberIds && data.companyMemberIds.length > 0;
    return hasAssignments || hasMembers;
}, { message: "At least one assignmentId or companyMemberId must be provided" });
export const submitInterviewEvaluationDto = z.object({
    overallScore: interviewEvaluationOverallScoreValidator,
    communicationScore: interviewEvaluationScoreValidator,
    technicalScore: interviewEvaluationScoreValidator,
    problemSolvingScore: interviewEvaluationScoreValidator,
    behaviourScore: interviewEvaluationScoreValidator,
    cultureFitScore: interviewEvaluationScoreValidator,
    recommendation: interviewEvaluationRecommendationValidator,
    strengths: interviewEvaluationStrengthsValidator,
    improvements: interviewEvaluationImprovementsValidator,
    comments: interviewEvaluationCommentsValidator
});
//# sourceMappingURL=interviews.dto.js.map