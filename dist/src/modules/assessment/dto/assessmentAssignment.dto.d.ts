import { z } from "zod";
export declare const attachAssessmentsToJobSchema: z.ZodObject<{
    assessments: z.ZodArray<z.ZodObject<{
        assessmentId: z.ZodString;
        displayOrder: z.ZodOptional<z.ZodNumber>;
        isMandatory: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type AttachAssessmentsToJobDto = z.infer<typeof attachAssessmentsToJobSchema>;
export declare const jobIdParamSchema: z.ZodObject<{
    jobId: z.ZodString;
}, z.core.$strip>;
export type JobIdParamDto = z.infer<typeof jobIdParamSchema>;
export declare const jobAssessmentIdParamSchema: z.ZodObject<{
    jobAssessmentId: z.ZodString;
}, z.core.$strip>;
export type JobAssessmentIdParamDto = z.infer<typeof jobAssessmentIdParamSchema>;
export declare const reorderJobAssessmentsSchema: z.ZodObject<{
    jobId: z.ZodString;
    assessments: z.ZodArray<z.ZodObject<{
        assessmentId: z.ZodString;
        displayOrder: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type ReorderJobAssessmentsDto = z.infer<typeof reorderJobAssessmentsSchema>;
export declare const createAssessmentInvitationSchema: z.ZodObject<{
    assessmentId: z.ZodString;
    expiresAt: z.ZodString;
    sendEmail: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export type CreateAssessmentInvitationDto = z.infer<typeof createAssessmentInvitationSchema>;
export declare const applicationIdParamSchema: z.ZodObject<{
    applicationId: z.ZodString;
}, z.core.$strip>;
export type ApplicationIdParamDto = z.infer<typeof applicationIdParamSchema>;
export declare const tokenParamSchema: z.ZodObject<{
    token: z.ZodString;
}, z.core.$strip>;
export type TokenParamDto = z.infer<typeof tokenParamSchema>;
export declare const invitationIdParamSchema: z.ZodObject<{
    invitationId: z.ZodString;
}, z.core.$strip>;
export type InvitationIdParamDto = z.infer<typeof invitationIdParamSchema>;
//# sourceMappingURL=assessmentAssignment.dto.d.ts.map