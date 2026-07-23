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
    status: z.enum([ApplicationStatus.INREVIEW, ApplicationStatus.SHORTLISTED, ApplicationStatus.INTERVIEW, ApplicationStatus.OFFERED, ApplicationStatus.HIRED, ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN])
})

export type UpdateApplicationStatusDto = z.infer<typeof updateApplicationStatusDto>