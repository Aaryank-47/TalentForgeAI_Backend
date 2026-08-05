import { z } from "zod";
import {
    assessmentIdValidator,
    assessmentSectionDisplayOrderValidator,
    jobIdValidator
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

