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
