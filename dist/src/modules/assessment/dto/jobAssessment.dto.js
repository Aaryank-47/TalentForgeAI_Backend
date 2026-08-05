import { z } from "zod";
export const attachAssessmentsToJobSchema = z.object({
    assessments: z.array(z.object({
        assessmentId: z.string().cuid("Invalid assessment ID"),
        displayOrder: z.number().int("displayOrder must be an integer").min(1),
        isMandatory: z.boolean().default(true)
    })).min(1, "At least one assessment is required")
});
export const jobIdParamSchema = z.object({
    jobId: z.string().cuid("Invalid job ID")
});
//# sourceMappingURL=jobAssessment.dto.js.map