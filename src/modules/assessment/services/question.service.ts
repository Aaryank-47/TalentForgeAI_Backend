import { QuestionRepository } from "../repositories/question.repository.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import type { QuestionCategory } from "@prisma/client";
import type { GetQuestionCategoriesDto, UpdateQuestionCategoryDto } from "../dto/question.dto.js";
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

    static async getCategoryById(id: string): Promise<QuestionCategory> {
        const category = await QuestionRepository.findQuestionCategoryById(id);
        if (!category) throw new NotFoundError("Question category not found");
        return category;
    }

    static async updateQueCategory(
        id: string,
        data: UpdateQuestionCategoryDto
    ): Promise<QuestionCategory> {
        const category = await QuestionRepository.findQuestionCategoryById(id);
        if (!category) throw new NotFoundError("Question category not found");

        if (data.parentId) {
            if (data.parentId === id) {
                throw new ConflictError("A category cannot be its own parent");
            }
            const parent = await QuestionRepository.findQuestionCategoryById(data.parentId);
            if (!parent) throw new NotFoundError("Parent category not found");
        }

        if (data.name !== undefined || data.parentId !== undefined) {
            const targetName = data.name !== undefined ? data.name : category.name;
            const targetParentId = data.parentId !== undefined ? data.parentId : category.parentId;

            const duplicate = await QuestionRepository.findQueCategoryByNameAndParent(targetName, targetParentId);
            if (duplicate && duplicate.id !== id) {
                throw new ConflictError(`Question category already exists under this parent id: ${targetParentId ?? "null"}`);
            }
        }

        return await QuestionRepository.updateQueCategory(id, data);
    }

    static async deleteQueCategory(id: string): Promise<void> {
        const category = await QuestionRepository.findQuestionCategoryById(id);
        if (!category) throw new NotFoundError("Question category not found");

        const hasChildren = await QuestionRepository.hasChildCategories(id);
        if (hasChildren) {
            throw new ConflictError(`Cannot delete category "${category.name}" because it still has child categories.`);
        }

        const hasQuestions = await QuestionRepository.hasQuestions(id);
        if (hasQuestions) {
            throw new ConflictError(`Cannot delete category "${category.name}" because questions still reference it.`);
        }

        await QuestionRepository.softDeleteQueCategory(id);
    }
}