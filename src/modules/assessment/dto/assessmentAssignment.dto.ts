import { z } from "zod";
import {
    assessmentIdValidator,
    assessmentSectionDisplayOrderValidator,
    jobIdValidator,
    applicationIdValidator
} from "../../../common/validators/validators.js"

export const attachAssessmentsToJobSchema = z.object({
    assessments: z.array(
        z.object({
            assessmentId: assessmentIdValidator,
            displayOrder: assessmentSectionDisplayOrderValidator.optional(),
            isMandatory: z.boolean().optional()
        })
    ).min(1, "At least one assessment is required")
});

export type AttachAssessmentsToJobDto = z.infer<typeof attachAssessmentsToJobSchema>;

export const jobIdParamSchema = z.object({
    jobId: jobIdValidator
});

export type JobIdParamDto = z.infer<typeof jobIdParamSchema>;

export const jobAssessmentIdParamSchema = z.object({
    jobAssessmentId: z.string().refine(val => val.includes("_"), {
        message: "Invalid job assessment ID format (must be jobId_assessmentId)"
    })
});

export type JobAssessmentIdParamDto = z.infer<typeof jobAssessmentIdParamSchema>;

export const reorderJobAssessmentsSchema = z.object({
    jobId: jobIdValidator,
    assessments: z.array(
        z.object({
            assessmentId: assessmentIdValidator,
            displayOrder: assessmentSectionDisplayOrderValidator
        })
    ).min(1, "At least one assessment is required")
});

export type ReorderJobAssessmentsDto = z.infer<typeof reorderJobAssessmentsSchema>;

export const createAssessmentInvitationSchema = z.object({
    assessmentId: assessmentIdValidator,
    expiresAt: z.string().datetime({ message: "Invalid expiration datetime" }),
    sendEmail: z.boolean().optional().default(true)
});

export type CreateAssessmentInvitationDto = z.infer<typeof createAssessmentInvitationSchema>;

export const applicationIdParamSchema = z.object({
    applicationId: applicationIdValidator
});

export type ApplicationIdParamDto = z.infer<typeof applicationIdParamSchema>;

export const tokenParamSchema = z.object({
    token: z.string().min(1, "Token is required")
});

export type TokenParamDto = z.infer<typeof tokenParamSchema>;

export const invitationIdParamSchema = z.object({
    invitationId: z.string().cuid("Invalid invitation ID")
});

export type InvitationIdParamDto = z.infer<typeof invitationIdParamSchema>;

