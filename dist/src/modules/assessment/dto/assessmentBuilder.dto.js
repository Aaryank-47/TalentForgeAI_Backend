import { z } from "zod";
import { assessmentIdValidator, assessmentTitleValidator, assessmentDescriptionValidator, assessmentInstructionsValidator, assessmentIsTemplateValidator, assessmentStatusValidator, assessmentSectionTitleValidator, assessmentSectionDescriptionValidator, assessmentSectionInstructionsValidator, assessmentSectionDurationMinutesValidator, assessmentSectionTypeValidator, assessmentSectionIdValidator } from "../../../common/validators/validators.js";
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
export const updateAssessmentSchema = z.object({
    title: assessmentTitleValidator.optional(),
    description: assessmentDescriptionValidator.optional(),
    instructions: assessmentInstructionsValidator.optional(),
    durationMinutes: z.number().int("Duration must be an integer").positive("Duration must be positive").optional(),
    passingScore: z.number().nonnegative("Passing score must be non-negative").optional(),
    totalMarks: z.number().positive("Total marks must be positive").optional(),
    isTemplate: assessmentIsTemplateValidator.optional(),
});
export const getAssessmentsQuerySchema = z.object({
    page: z.preprocess((val) => (val ? Number(val) : undefined), z.number().int().min(1).optional().default(1)),
    limit: z.preprocess((val) => (val ? Number(val) : undefined), z.number().int().min(1).max(100).optional().default(10)),
    search: z.string().trim().optional(),
    status: assessmentStatusValidator.optional(),
    companyId: z.string().cuid().optional(),
    isTemplate: z.preprocess((val) => {
        if (val === "true")
            return true;
        if (val === "false")
            return false;
        return val;
    }, z.boolean().optional()),
    sortBy: z.enum(["createdAt", "title", "durationMinutes", "totalMarks", "passingScore"]).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});
export const assessmentIdParamSchema = z.object({
    assessmentId: assessmentIdValidator,
});
export const createAssessmentSectionSchema = z.object({
    title: assessmentSectionTitleValidator,
    description: assessmentSectionDescriptionValidator.optional(),
    instructions: assessmentSectionInstructionsValidator.optional(),
    sectionType: assessmentSectionTypeValidator,
    durationMinutes: assessmentSectionDurationMinutesValidator.optional()
});
export const sectionIdParamSchema = z.object({
    sectionId: assessmentSectionIdValidator,
});
export const updateAssessmentSectionSchema = z.object({
    title: assessmentSectionTitleValidator.optional(),
    description: assessmentSectionDescriptionValidator.optional(),
    instructions: assessmentSectionInstructionsValidator.optional(),
    durationMinutes: assessmentSectionDurationMinutesValidator.optional()
});
export const reorderSectionsSchema = z.object({
    assessmentId: assessmentIdValidator,
    sections: z.array(z.object({
        sectionId: assessmentSectionIdValidator,
        displayOrder: z.number().int().positive("Display order must be positive")
    })).min(1, "At least one section must be provided")
});
export const addQuestionsToSectionSchema = z.object({
    questions: z.array(z.object({
        questionId: z.string().cuid("Invalid question ID"),
        marksOverride: z.number().positive("Marks override must be positive").optional(),
        timeLimitOverride: z.number().int().positive("Time limit override must be positive").optional(),
    })).min(1, "At least one question must be provided")
});
export const updateSectionItemSchema = z.object({
    marksOverride: z.number().positive("Marks override must be positive").optional().nullable(),
    timeLimitOverride: z.number().int().positive("Time limit override must be positive").optional().nullable(),
    isRequired: z.boolean().optional()
});
export const sectionItemIdParamSchema = z.object({
    sectionItemId: z.string().cuid("Invalid section item ID")
});
export const reorderQuestionsSchema = z.object({
    sectionId: z.string().cuid("Invalid section ID"),
    items: z.array(z.object({
        sectionItemId: z.string().cuid("Invalid section item ID"),
        displayOrder: z.number().int().positive("Display order must be positive")
    })).min(1, "At least one item must be provided")
});
//# sourceMappingURL=assessmentBuilder.dto.js.map