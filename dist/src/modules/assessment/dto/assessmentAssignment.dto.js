import { z } from "zod";
import { assessmentIdValidator, assessmentSectionDisplayOrderValidator, jobIdValidator, applicationIdValidator } from "../../../common/validators/validators.js";
export const attachAssessmentsToJobSchema = z.object({
    assessments: z.array(z.object({
        assessmentId: assessmentIdValidator,
        displayOrder: assessmentSectionDisplayOrderValidator.optional(),
        isMandatory: z.boolean().optional()
    })).min(1, "At least one assessment is required")
});
export const jobIdParamSchema = z.object({
    jobId: jobIdValidator
});
export const jobAssessmentIdParamSchema = z.object({
    jobAssessmentId: z.string().refine(val => val.includes("_"), {
        message: "Invalid job assessment ID format (must be jobId_assessmentId)"
    })
});
export const reorderJobAssessmentsSchema = z.object({
    jobId: jobIdValidator,
    assessments: z.array(z.object({
        assessmentId: assessmentIdValidator,
        displayOrder: assessmentSectionDisplayOrderValidator
    })).min(1, "At least one assessment is required")
});
export const createAssessmentInvitationSchema = z.object({
    assessmentId: assessmentIdValidator,
    expiresAt: z.string().datetime({ message: "Invalid expiration datetime" }),
    sendEmail: z.boolean().optional().default(true)
});
export const applicationIdParamSchema = z.object({
    applicationId: applicationIdValidator
});
export const tokenParamSchema = z.object({
    token: z.string().min(1, "Token is required")
});
export const invitationIdParamSchema = z.object({
    invitationId: z.string().cuid("Invalid invitation ID")
});
//# sourceMappingURL=assessmentAssignment.dto.js.map