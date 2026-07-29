import z from "zod";
import { ApplicationStatus } from "../../../common/enums/all_enums.js";
export declare class ApplicationDto {
    static applyJob: z.ZodObject<{
        resumeId: z.ZodString;
        jobId: z.ZodString;
    }, z.z.core.$strip>;
    static updateApplicationStatus: z.ZodObject<{
        applicationId: z.ZodString;
        status: z.ZodEnum<{
            INREVIEW: ApplicationStatus.INREVIEW;
            WITHDRAWN: ApplicationStatus.WITHDRAWN;
            HIRED: ApplicationStatus.HIRED;
            REJECTED: ApplicationStatus.REJECTED;
        }>;
    }, z.z.core.$strip>;
    static withdrawApplication: z.ZodObject<{
        status: z.ZodLiteral<ApplicationStatus.WITHDRAWN>;
        withdrawReason: z.ZodOptional<z.ZodString>;
    }, z.z.core.$strip>;
    static applicationIdParam: z.ZodObject<{
        applicationId: z.ZodString;
    }, z.z.core.$strip>;
    static jobIdParam: z.ZodObject<{
        jobId: z.ZodString;
    }, z.z.core.$strip>;
}
export type ApplyJobDto = z.infer<typeof ApplicationDto.applyJob>;
export type UpdateApplicationStatusDto = z.infer<typeof ApplicationDto.updateApplicationStatus>;
export type WithdrawApplicationDto = z.infer<typeof ApplicationDto.withdrawApplication>;
export type ApplicationIdParamDto = z.infer<typeof ApplicationDto.applicationIdParam>;
export type JobIdParamDto = z.infer<typeof ApplicationDto.jobIdParam>;
//# sourceMappingURL=application.dto.d.ts.map