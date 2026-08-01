import { QuestionRepository } from "../repositories/question.repository.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import type { QuestionCategory } from "@prisma/client";

export class QuestionService {
    static async createQueCategory(
        name: string,
        parentId?: string | null
    ): Promise<QuestionCategory> {
        const parentIdValue = parentId ?? null;

        const queCategoryExists = await QuestionRepository.findQueCategoryByNameAndParent(name, parentIdValue);

        if (queCategoryExists)
            throw new ConflictError(`Question category already exists under this parent id: ${parentIdValue ?? "null"}`);

        if (parentIdValue) {
            const parentCategory = await QuestionRepository.findQuestionCategoryById(parentIdValue);
            if (!parentCategory) throw new NotFoundError("Parent category not found");
        }

        return await QuestionRepository.createQueCategory(name, parentIdValue);
    }
}