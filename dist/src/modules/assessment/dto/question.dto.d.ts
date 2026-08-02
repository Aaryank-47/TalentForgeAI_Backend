import { z } from "zod";
export declare class QuestionCategoryDto {
    static createCategory: z.ZodObject<{
        name: z.ZodString;
        parentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>;
    static categoryIdParams: z.ZodObject<{
        categoryId: z.ZodString;
    }, z.core.$strip>;
    static updateCategory: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        displayOrder: z.ZodOptional<z.ZodNumber>;
        parentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>;
}
export type CreateQuestionCategoryDto = z.infer<typeof QuestionCategoryDto.createCategory>;
export type UpdateQuestionCategoryDto = z.infer<typeof QuestionCategoryDto.updateCategory>;
export declare const getQuestionCategoriesDto: z.ZodObject<{
    page: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    search: z.ZodOptional<z.ZodString>;
    parentId: z.ZodOptional<z.ZodString>;
    includeChildren: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    sortBy: z.ZodOptional<z.ZodEnum<{
        name: "name";
        createdAt: "createdAt";
    }>>;
    sortOrder: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
}, z.core.$strip>;
export type GetQuestionCategoriesDto = z.infer<typeof getQuestionCategoriesDto>;
export declare class QuestionTagDto {
    static createTag: z.ZodObject<{
        name: z.ZodString;
    }, z.core.$strip>;
    static tagIdParams: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    static updateTag: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}
export type CreateQuestionTagDto = z.infer<typeof QuestionTagDto.createTag>;
export type UpdateQuestionTagDto = z.infer<typeof QuestionTagDto.updateTag>;
export declare const getQuestionTagsDto: z.ZodObject<{
    page: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodEnum<{
        name: "name";
        createdAt: "createdAt";
    }>>;
    sortOrder: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
}, z.core.$strip>;
export type GetQuestionTagsDto = z.infer<typeof getQuestionTagsDto>;
export declare class ProgrammingLanguageDto {
    static createLanguage: z.ZodObject<{
        name: z.ZodString;
        isActive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, z.core.$strip>;
    static languageIdParams: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    static updateLanguage: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        isActive: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}
export type CreateProgrammingLanguageDto = z.infer<typeof ProgrammingLanguageDto.createLanguage>;
export type UpdateProgrammingLanguageDto = z.infer<typeof ProgrammingLanguageDto.updateLanguage>;
export declare const getProgrammingLanguagesDto: z.ZodObject<{
    page: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    search: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    sortBy: z.ZodOptional<z.ZodEnum<{
        slug: "slug";
        name: "name";
        createdAt: "createdAt";
    }>>;
    sortOrder: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
}, z.core.$strip>;
export type GetProgrammingLanguagesDto = z.infer<typeof getProgrammingLanguagesDto>;
export declare class DSASupportedLanguageDto {
    static createSupportedLanguages: z.ZodObject<{
        dsaDetailId: z.ZodString;
        programmingLanguageIds: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
    static deleteSupportedLanguages: z.ZodObject<{
        dsaDetailId: z.ZodString;
        programmingLanguageIds: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
}
export type CreateDSASupportedLanguagesDto = z.infer<typeof DSASupportedLanguageDto.createSupportedLanguages>;
export type DeleteDSASupportedLanguagesDto = z.infer<typeof DSASupportedLanguageDto.deleteSupportedLanguages>;
//# sourceMappingURL=question.dto.d.ts.map