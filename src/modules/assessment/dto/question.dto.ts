import { z } from "zod";
import {
    questionCategoryIdValidator,
    questionCategoryNameValidator
} from "../../../common/validators/validators.js";

export class QuestionCategoryDto {
    static createCategory = z.object({
        name: questionCategoryNameValidator,
        parentId: questionCategoryIdValidator.optional().nullable(),
    });
}

export type CreateQuestionCategoryDto = z.infer<typeof QuestionCategoryDto.createCategory>;


export const getQuestionCategoriesDto = z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    search: z.string().trim().optional(),
    parentId: z.string().cuid().optional(),
    includeChildren: z.coerce.boolean().optional(),
    sortBy: z.enum(["name", "createdAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type GetQuestionCategoriesDto = z.infer<typeof getQuestionCategoriesDto>;