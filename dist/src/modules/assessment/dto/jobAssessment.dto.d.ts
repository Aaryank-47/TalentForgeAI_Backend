import { z } from "zod";
export declare const attachAssessmentsToJobSchema: z.ZodObject<{
    assessments: z.ZodArray<z.ZodObject<{
        assessmentId: z.ZodString;
        displayOrder: z.ZodNumber;
        isMandatory: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type AttachAssessmentsToJobDto = z.infer<typeof attachAssessmentsToJobSchema>;
export declare const jobIdParamSchema: z.ZodObject<{
    jobId: z.ZodString;
}, z.core.$strip>;
export type JobIdParamDto = z.infer<typeof jobIdParamSchema>;
//# sourceMappingURL=jobAssessment.dto.d.ts.map