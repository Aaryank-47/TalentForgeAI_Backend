import z from "zod"
import { ApplicationStatus } from "../../../common/enums/all_enums.js";
import { resumeIdValidator, applicationIdValidator, jobIdValidator } from "../../../common/validators/validators.js";

export const applyJobDto = z.object({
    resumeId: resumeIdValidator,
    jobId: jobIdValidator
})

export type ApplyJobDto = z.infer<typeof applyJobDto>

export const updateApplicationStatusDto = z.object({
    applicationId: applicationIdValidator,
    status: z.enum([
        ApplicationStatus.INREVIEW,
        ApplicationStatus.SHORTLISTED,
        ApplicationStatus.INTERVIEW,
        ApplicationStatus.OFFERED,
        ApplicationStatus.HIRED,
        ApplicationStatus.REJECTED,
        ApplicationStatus.WITHDRAWN
    ])
})

export type UpdateApplicationStatusDto = z.infer<typeof updateApplicationStatusDto>

export const withdrawApplicationDto = z.object({
    status: z.literal(ApplicationStatus.WITHDRAWN),
    withdrawReason: z.string().min(1, "Withdraw reason is required").optional()
})

export type WithdrawApplicationDto = z.infer<typeof withdrawApplicationDto>

export const applicationIdParamDto = z.object({
    applicationId: applicationIdValidator,
})

export type ApplicationIdParamDto = z.infer<typeof applicationIdParamDto>

export const jobIdParamDto = z.object({
    jobId: jobIdValidator,
})

export type JobIdParamDto = z.infer<typeof jobIdParamDto>