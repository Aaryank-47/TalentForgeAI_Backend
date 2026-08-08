import { z } from "zod";
import { AttemptStatus } from "@prisma/client";
import {
    questionIdValidator,
    selectedOptionIdsValidator,
    attachmentUrlsValidator,
    codeResponseValidator,
    submissionUrlValidator,
    metaValidator
} from "../../../common/validators/validators.js"

export const tokenParamSchema = z.object({
    token: z.string().min(1, "Token is required")
});

export type TokenParamDto = z.infer<typeof tokenParamSchema>;

export const startAssessmentAttemptSchema = z.object({
    invitationToken: z.string().min(1, "Invitation token is required")
});

export type StartAssessmentAttemptDto = z.infer<typeof startAssessmentAttemptSchema>;

export const getAttemptsQuerySchema = z.object({
    page: z.preprocess((val) => (val ? Number(val) : 1), z.number().int().positive().default(1)),
    limit: z.preprocess((val) => (val ? Number(val) : 10), z.number().int().positive().default(10)),
    status: z.nativeEnum(AttemptStatus).optional()
});

export type GetAttemptsQueryDto = z.infer<typeof getAttemptsQuerySchema>;

export const createAssessmentAnswerSchema = z.object({
    questionId: questionIdValidator,
    selectedOptionIds: selectedOptionIdsValidator.optional(),
    codeResponse: codeResponseValidator.optional(),
    submissionUrl: submissionUrlValidator.optional(),
    attachmentUrls: attachmentUrlsValidator.optional(),
    meta: metaValidator.optional()
});

export type CreateAssessmentAnswerDto = z.infer<typeof createAssessmentAnswerSchema>;

export const mcqValidationSchema = z.object({
    questionId: questionIdValidator,
    selectedOptionIds: selectedOptionIdsValidator,
    meta: metaValidator.optional()
}).strict();

export const dsaValidationSchema = z.object({
    questionId: questionIdValidator,
    codeResponse: codeResponseValidator,
    meta: metaValidator
}).strict();

export const projectValidationSchema = z.object({
    questionId: questionIdValidator,
    submissionUrl: submissionUrlValidator.optional(),
    attachmentUrls: attachmentUrlsValidator.optional(),
    codeResponse: codeResponseValidator.optional(),
    meta: metaValidator.optional()
}).strict();

export const saveAssessmentAnswerSchema = z.object({
    selectedOptionIds: selectedOptionIdsValidator.optional(),
    codeResponse: codeResponseValidator.optional(),
    submissionUrl: submissionUrlValidator.optional(),
    attachmentUrls: attachmentUrlsValidator.optional(),
    meta: metaValidator.optional()
});

export type SaveAssessmentAnswerDto = z.infer<typeof saveAssessmentAnswerSchema>;

export const mcqSaveValidationSchema = z.object({
    selectedOptionIds: selectedOptionIdsValidator,
    meta: metaValidator.optional()
}).strict();

export const dsaSaveValidationSchema = z.object({
    codeResponse: codeResponseValidator,
    meta: metaValidator
}).strict();

export const projectSaveValidationSchema = z.object({
    submissionUrl: submissionUrlValidator.optional(),
    attachmentUrls: attachmentUrlsValidator.optional(),
    codeResponse: codeResponseValidator.optional(),
    meta: metaValidator.optional()
}).strict();

export const saveAnswerParamsSchema = z.object({
    attemptId: questionIdValidator,
    questionId: questionIdValidator
});



