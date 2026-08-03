import { z } from "zod";
import {
    assessmentIdValidator,
    assessmentTitleValidator,
    assessmentDescriptionValidator,
    assessmentInstructionsValidator,
    assessmentIsTemplateValidator,
    assessmentStatusValidator
} from "../../../common/validators/validators.js";

export const createAssessmentSchema = z.object({
    companyId: z.string().cuid("Invalid company ID"),
    title: assessmentTitleValidator,
    description: assessmentDescriptionValidator.optional(),
    instructions: assessmentInstructionsValidator.optional(),
    durationMinutes: z.number().int("Duration must be an integer").positive("Duration must be positive"),
    passingScore: z.number().nonnegative("Passing score must be non-negative"),
    totalMarks: z.number().positive("Total marks must be positive"),
    isTemplate: assessmentIsTemplateValidator.optional().default(false),
});

export type CreateAssessmentDto = z.infer<typeof createAssessmentSchema>;

export const updateAssessmentSchema = z.object({
    title: assessmentTitleValidator.optional(),
    description: assessmentDescriptionValidator.optional(),
    instructions: assessmentInstructionsValidator.optional(),
    durationMinutes: z.number().int("Duration must be an integer").positive("Duration must be positive").optional(),
    passingScore: z.number().nonnegative("Passing score must be non-negative").optional(),
    totalMarks: z.number().positive("Total marks must be positive").optional(),
    isTemplate: assessmentIsTemplateValidator.optional(),
});

export type UpdateAssessmentDto = z.infer<typeof updateAssessmentSchema>;

export const getAssessmentsQuerySchema = z.object({
    page: z.preprocess((val) => (val ? Number(val) : undefined), z.number().int().min(1).optional().default(1)),
    limit: z.preprocess((val) => (val ? Number(val) : undefined), z.number().int().min(1).max(100).optional().default(10)),
    search: z.string().trim().optional(),
    status: assessmentStatusValidator.optional(),
    companyId: z.string().cuid().optional(),
    isTemplate: z.preprocess((val) => {
        if (val === "true") return true;
        if (val === "false") return false;
        return val;
    }, z.boolean().optional()),
    sortBy: z.enum(["createdAt", "title", "durationMinutes", "totalMarks", "passingScore"]).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type GetAssessmentsQueryDto = z.infer<typeof getAssessmentsQuerySchema>;

export const assessmentIdParamSchema = z.object({
    assessmentId: assessmentIdValidator,
});

export type AssessmentIdParamDto = z.infer<typeof assessmentIdParamSchema>;
