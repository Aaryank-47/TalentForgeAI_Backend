import { z } from "zod";
export declare const tokenParamSchema: z.ZodObject<{
    token: z.ZodString;
}, z.core.$strip>;
export type TokenParamDto = z.infer<typeof tokenParamSchema>;
export declare const startAssessmentAttemptSchema: z.ZodObject<{
    invitationToken: z.ZodString;
}, z.core.$strip>;
export type StartAssessmentAttemptDto = z.infer<typeof startAssessmentAttemptSchema>;
export declare const getAttemptsQuerySchema: z.ZodObject<{
    page: z.ZodPreprocess<z.ZodDefault<z.ZodNumber>>;
    limit: z.ZodPreprocess<z.ZodDefault<z.ZodNumber>>;
    status: z.ZodOptional<z.ZodEnum<{
        NOT_STARTED: "NOT_STARTED";
        IN_PROGRESS: "IN_PROGRESS";
        SUBMITTED: "SUBMITTED";
        EXPIRED: "EXPIRED";
        CANCELLED: "CANCELLED";
    }>>;
}, z.core.$strip>;
export type GetAttemptsQueryDto = z.infer<typeof getAttemptsQuerySchema>;
export declare const createAssessmentAnswerSchema: z.ZodObject<{
    questionId: z.ZodString;
    selectedOptionIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    codeResponse: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    submissionUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    attachmentUrls: z.ZodOptional<z.ZodArray<z.ZodString>>;
    meta: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
}, z.core.$strip>;
export type CreateAssessmentAnswerDto = z.infer<typeof createAssessmentAnswerSchema>;
export declare const mcqValidationSchema: z.ZodObject<{
    questionId: z.ZodString;
    selectedOptionIds: z.ZodArray<z.ZodString>;
    meta: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
}, z.core.$strict>;
export declare const dsaValidationSchema: z.ZodObject<{
    questionId: z.ZodString;
    codeResponse: z.ZodOptional<z.ZodString>;
    meta: z.ZodOptional<z.ZodAny>;
}, z.core.$strict>;
export declare const projectValidationSchema: z.ZodObject<{
    questionId: z.ZodString;
    submissionUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    attachmentUrls: z.ZodOptional<z.ZodArray<z.ZodString>>;
    codeResponse: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    meta: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
}, z.core.$strict>;
export declare const saveAssessmentAnswerSchema: z.ZodObject<{
    selectedOptionIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    codeResponse: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    submissionUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    attachmentUrls: z.ZodOptional<z.ZodArray<z.ZodString>>;
    meta: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
}, z.core.$strip>;
export type SaveAssessmentAnswerDto = z.infer<typeof saveAssessmentAnswerSchema>;
export declare const mcqSaveValidationSchema: z.ZodObject<{
    selectedOptionIds: z.ZodArray<z.ZodString>;
    meta: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
}, z.core.$strict>;
export declare const dsaSaveValidationSchema: z.ZodObject<{
    codeResponse: z.ZodOptional<z.ZodString>;
    meta: z.ZodOptional<z.ZodAny>;
}, z.core.$strict>;
export declare const projectSaveValidationSchema: z.ZodObject<{
    submissionUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    attachmentUrls: z.ZodOptional<z.ZodArray<z.ZodString>>;
    codeResponse: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    meta: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
}, z.core.$strict>;
export declare const saveAnswerParamsSchema: z.ZodObject<{
    attemptId: z.ZodString;
    questionId: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=candidateAssessment.dto.d.ts.map