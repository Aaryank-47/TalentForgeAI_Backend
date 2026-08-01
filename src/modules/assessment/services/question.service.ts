import { QuestionRepository } from "../repositories/question.repository.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import type { QuestionCategory } from "@prisma/client";
import type { GetQuestionCategoriesDto } from "../dto/question.dto.js";
import { PaginationHelper } from "../../../common/helper/pagination.helper.js";

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

    static async getAllQueCategories(
        filters: GetQuestionCategoriesDto
    ): Promise<any> {
        const pagination = PaginationHelper.getPagination(filters);
        const totalItems = await QuestionRepository.countQuestionCategories(filters);
        const categories = await QuestionRepository.getAllQueCategories(filters, pagination);

        return PaginationHelper.buildResponse(
            categories,
            pagination,
            totalItems
        );
    }
}