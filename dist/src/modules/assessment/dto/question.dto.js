import { z } from "zod";
import { questionCategoryIdValidator, questionCategoryNameValidator, questionTagIdValidator, questionTagNameValidator, programmingLanguageIdValidator, programmingLanguageNameValidator, programmingLanguageIsActiveValidator, dsaDetailIdValidator, questionIdValidator, questionTitleValidator, questionDescriptionValidator, questionTypeValidator, questionDifficultyValidator, questionEstimatedTimeValidator, questionDefaultMarksValidator, questionOwnershipValidator, questionStatusValidator, mcqOptionTextValidator, mcqOptionDisplayOrderValidator, mcqOptionIsCorrectValidator, dsaStarterCodeValidator, dsaReferenceSolutionValidator, dsaMemoryLimitValidator, dsaTimeLimitValidator, testCaseInputValidator, testCaseExpectedOutputValidator, testCaseTypeValidator, testCaseExplanationValidator, testCaseDisplayOrderValidator, uuidValidator } from "../../../common/validators/validators.js";
export class QuestionCategoryDto {
    static createCategory = z.object({
        name: questionCategoryNameValidator,
        parentId: questionCategoryIdValidator.optional().nullable(),
    });
    static categoryIdParams = z.object({
        categoryId: questionCategoryIdValidator,
    });
    static updateCategory = z.object({
        name: questionCategoryNameValidator.optional(),
        displayOrder: z.number().int().min(0).optional(),
        parentId: questionCategoryIdValidator.optional().nullable(),
    });
}
export const getQuestionCategoriesDto = z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    search: z.string().trim().optional(),
    parentId: z.string().cuid().optional(),
    includeChildren: z.coerce.boolean().optional(),
    sortBy: z.enum(["name", "createdAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
});
export class QuestionTagDto {
    static createTag = z.object({
        name: questionTagNameValidator,
    });
    static tagIdParams = z.object({
        id: questionTagIdValidator,
    });
    static updateTag = z.object({
        name: questionTagNameValidator.optional(),
    });
}
export const getQuestionTagsDto = z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    search: z.string().trim().optional(),
    sortBy: z.enum(["name", "createdAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
});
export class ProgrammingLanguageDto {
    static createLanguage = z.object({
        name: programmingLanguageNameValidator,
        isActive: programmingLanguageIsActiveValidator.optional().default(true),
    });
    static languageIdParams = z.object({
        id: programmingLanguageIdValidator,
    });
    static updateLanguage = z.object({
        name: programmingLanguageNameValidator.optional(),
        isActive: programmingLanguageIsActiveValidator.optional(),
    });
}
export const getProgrammingLanguagesDto = z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    search: z.string().trim().optional(),
    isActive: z.coerce.boolean().optional(),
    sortBy: z.enum(["name", "slug", "createdAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
});
export class DSASupportedLanguageDto {
    static createSupportedLanguages = z.object({
        questionId: questionIdValidator,
        programmingLanguageIds: z.array(programmingLanguageIdValidator).min(1, "At least one programming language ID is required"),
    });
    static deleteSupportedLanguages = z.object({
        questionId: questionIdValidator,
        programmingLanguageIds: z.array(programmingLanguageIdValidator).min(1, "At least one programming language ID is required"),
    });
}
const mcqOptionSchema = z.object({
    optionText: mcqOptionTextValidator,
    displayOrder: mcqOptionDisplayOrderValidator,
    isCorrect: mcqOptionIsCorrectValidator,
});
const mcqDetailSchema = z.object({
    allowMultipleCorrectAnswers: z.boolean().default(false),
    negativeMarks: z.number().nonnegative().default(0.0),
    options: z.array(mcqOptionSchema).min(2, "At least 2 options are required"),
});
const testCaseSchema = z.object({
    input: testCaseInputValidator,
    expectedOutput: testCaseExpectedOutputValidator,
    type: testCaseTypeValidator.default("SAMPLE"),
    explanation: testCaseExplanationValidator.optional().nullable(),
    displayOrder: testCaseDisplayOrderValidator,
});
const dsaDetailSchema = z.object({
    starterCode: dsaStarterCodeValidator,
    referenceSolution: dsaReferenceSolutionValidator,
    memoryLimit: dsaMemoryLimitValidator,
    timeLimit: dsaTimeLimitValidator,
    supportedLanguageIds: z.array(programmingLanguageIdValidator).min(1, "At least one supported language is required"),
    testCases: z.array(testCaseSchema).min(1, "At least one test case is required"),
});
const machineCodingDetailSchema = z.object({
    repositoryTemplate: z.string().trim().url("Please enter a valid URL").optional().nullable(),
    projectStructure: z.string().trim().optional().nullable(),
    techStack: z.string().trim().optional().nullable(),
    implementationInstructions: z.string().trim().min(5, "Instructions must be at least 5 characters long"),
    evaluationGuidelines: z.string().trim().optional().nullable(),
});
const projectDetailSchema = z.object({
    requirements: z.string().trim().min(5, "Requirements must be at least 5 characters long"),
    submissionInstructions: z.string().trim().min(5, "Instructions must be at least 5 characters long"),
    deadlineHours: z.number().int().positive("Deadline hours must be a positive integer"),
});
export const createQuestionSchema = z.object({
    title: questionTitleValidator,
    description: questionDescriptionValidator,
    type: questionTypeValidator,
    difficulty: questionDifficultyValidator,
    estimatedTime: questionEstimatedTimeValidator,
    defaultMarks: questionDefaultMarksValidator,
    ownership: questionOwnershipValidator,
    categoryId: questionCategoryIdValidator.optional().nullable(),
    tagIds: z.array(questionTagIdValidator).optional(),
    companyId: uuidValidator.optional().nullable(),
    mcqDetail: mcqDetailSchema.optional().nullable(),
    dsaDetail: dsaDetailSchema.optional().nullable(),
    machineCodingDetail: machineCodingDetailSchema.optional().nullable(),
    projectDetail: projectDetailSchema.optional().nullable(),
}).refine(data => {
    if (data.type === "MCQ" && !data.mcqDetail)
        return false;
    if (data.type === "DSA" && !data.dsaDetail)
        return false;
    if (data.type === "MACHINE_CODING" && !data.machineCodingDetail)
        return false;
    if (data.type === "PROJECT" && !data.projectDetail)
        return false;
    return true;
}, {
    message: "Missing type-specific question details",
    path: ["type"]
});
export const updateQuestionSchema = z.object({
    title: questionTitleValidator.optional(),
    description: questionDescriptionValidator.optional(),
    difficulty: questionDifficultyValidator.optional(),
    estimatedTime: questionEstimatedTimeValidator.optional(),
    defaultMarks: questionDefaultMarksValidator.optional(),
    categoryId: questionCategoryIdValidator.optional().nullable(),
    tagIds: z.array(questionTagIdValidator).optional(),
    mcqDetail: mcqDetailSchema.optional().nullable(),
    dsaDetail: dsaDetailSchema.optional().nullable(),
    machineCodingDetail: machineCodingDetailSchema.optional().nullable(),
    projectDetail: projectDetailSchema.optional().nullable(),
});
export const getQuestionsQuerySchema = z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    search: z.string().trim().optional(),
    type: questionTypeValidator.optional(),
    difficulty: questionDifficultyValidator.optional(),
    status: questionStatusValidator.optional(),
    ownership: questionOwnershipValidator.optional(),
    categoryId: questionCategoryIdValidator.optional(),
    tagIds: z.string().optional(),
    companyId: uuidValidator.optional(),
    sortBy: z.enum(["title", "createdAt", "difficulty", "defaultMarks"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
});
export const questionIdParamsSchema = z.object({
    id: questionIdValidator,
});
//# sourceMappingURL=question.dto.js.map