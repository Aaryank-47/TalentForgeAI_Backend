import { QuestionRepository } from "../repositories/question.repository.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { PaginationHelper } from "../../../common/helper/pagination.helper.js";
export class QuestionService {
    static async createQueCategory(name, parentId) {
        const parentIdValue = parentId ?? null;
        const queCategoryExists = await QuestionRepository.findQueCategoryByNameAndParent(name, parentIdValue);
        if (queCategoryExists)
            throw new ConflictError(`Question category already exists under this parent id: ${parentIdValue ?? "null"}`);
        if (parentIdValue) {
            const parentCategory = await QuestionRepository.findQuestionCategoryById(parentIdValue);
            if (!parentCategory)
                throw new NotFoundError("Parent category not found");
        }
        return await QuestionRepository.createQueCategory(name, parentIdValue);
    }
    static async getAllQueCategories(filters) {
        const pagination = PaginationHelper.getPagination(filters);
        const totalItems = await QuestionRepository.countQuestionCategories(filters);
        const categories = await QuestionRepository.getAllQueCategories(filters, pagination);
        return PaginationHelper.buildResponse(categories, pagination, totalItems);
    }
    static async getCategoryById(id) {
        const category = await QuestionRepository.findQuestionCategoryById(id);
        if (!category)
            throw new NotFoundError("Question category not found");
        return category;
    }
    static async updateQueCategory(id, data) {
        const category = await QuestionRepository.findQuestionCategoryById(id);
        if (!category)
            throw new NotFoundError("Question category not found");
        if (data.parentId) {
            if (data.parentId === id) {
                throw new ConflictError("A category cannot be its own parent");
            }
            const parent = await QuestionRepository.findQuestionCategoryById(data.parentId);
            if (!parent)
                throw new NotFoundError("Parent category not found");
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
    static async deleteQueCategory(id) {
        const category = await QuestionRepository.findQuestionCategoryById(id);
        if (!category)
            throw new NotFoundError("Question category not found");
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
    static async createQuestionTag(name) {
        const existingTag = await QuestionRepository.findQuestionTagByName(name);
        if (existingTag) {
            throw new ConflictError(`Question tag "${name}" already exists`);
        }
        return await QuestionRepository.createQuestionTag(name);
    }
    static async getAllQuestionTags(filters) {
        const pagination = PaginationHelper.getPagination(filters);
        const totalItems = await QuestionRepository.countQuestionTags(filters);
        const tags = await QuestionRepository.getAllQuestionTags(filters, pagination);
        return PaginationHelper.buildResponse(tags, pagination, totalItems);
    }
    static async getQuestionTagById(id) {
        const tag = await QuestionRepository.findQuestionTagById(id);
        if (!tag) {
            throw new NotFoundError("Question tag not found");
        }
        return tag;
    }
    static async updateQuestionTag(id, data) {
        const tag = await QuestionRepository.findQuestionTagById(id);
        if (!tag) {
            throw new NotFoundError("Question tag not found");
        }
        if (data.name !== undefined) {
            const duplicate = await QuestionRepository.findQuestionTagByName(data.name);
            if (duplicate && duplicate.id !== id) {
                throw new ConflictError(`Question tag "${data.name}" already exists`);
            }
        }
        return await QuestionRepository.updateQuestionTag(id, data.name || tag.name);
    }
    static async deleteQuestionTag(id) {
        const tag = await QuestionRepository.findQuestionTagById(id);
        if (!tag) {
            throw new NotFoundError("Question tag not found");
        }
        const usageCount = await QuestionRepository.getTagUsageCount(id);
        if (usageCount > 0) {
            throw new ConflictError(`Cannot delete tag "${tag.name}" because it is currently used by ${usageCount} question(s).`);
        }
        await QuestionRepository.deleteQuestionTag(id);
    }
}
//# sourceMappingURL=question.service.js.map