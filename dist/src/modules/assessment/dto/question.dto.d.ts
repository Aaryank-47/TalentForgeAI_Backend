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
//# sourceMappingURL=question.dto.d.ts.map