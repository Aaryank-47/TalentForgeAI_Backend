import { z } from "zod";
import { questionCategoryIdValidator, questionCategoryNameValidator, questionTagIdValidator, questionTagNameValidator, programmingLanguageIdValidator, programmingLanguageNameValidator, programmingLanguageIsActiveValidator, dsaDetailIdValidator } from "../../../common/validators/validators.js";
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
        dsaDetailId: dsaDetailIdValidator,
        programmingLanguageIds: z.array(programmingLanguageIdValidator).min(1, "At least one programming language ID is required"),
    });
    static deleteSupportedLanguages = z.object({
        dsaDetailId: dsaDetailIdValidator,
        programmingLanguageIds: z.array(programmingLanguageIdValidator).min(1, "At least one programming language ID is required"),
    });
}
//# sourceMappingURL=question.dto.js.map