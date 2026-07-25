import z from "zod";
import { ApplicationStatus } from "../../../common/enums/all_enums.js";
import { resumeIdValidator, applicationIdValidator, jobIdValidator } from "../../../common/validators/validators.js";

export class ApplicationDto {
    static applyJob = z.object({
        resumeId: resumeIdValidator,
        jobId: jobIdValidator
    });

    static updateApplicationStatus = z.object({
        applicationId: applicationIdValidator,
        status: z.enum([
            ApplicationStatus.INREVIEW,
            ApplicationStatus.HIRED,
            ApplicationStatus.REJECTED,
            ApplicationStatus.WITHDRAWN
        ])
    });

    static withdrawApplication = z.object({
        status: z.literal(ApplicationStatus.WITHDRAWN),
        withdrawReason: z.string().min(1, "Withdraw reason is required").optional()
    });

    static applicationIdParam = z.object({
        applicationId: applicationIdValidator,
    });

    static jobIdParam = z.object({
        jobId: jobIdValidator,
    });
}

export type ApplyJobDto = z.infer<typeof ApplicationDto.applyJob>;
export type UpdateApplicationStatusDto = z.infer<typeof ApplicationDto.updateApplicationStatus>;
export type WithdrawApplicationDto = z.infer<typeof ApplicationDto.withdrawApplication>;
export type ApplicationIdParamDto = z.infer<typeof ApplicationDto.applicationIdParam>;
export type JobIdParamDto = z.infer<typeof ApplicationDto.jobIdParam>;