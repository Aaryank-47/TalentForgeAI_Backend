import { QuestionRepository } from "../repositories/question.repository.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import type { QuestionCategory, QuestionTag, ProgrammingLanguage, DSASupportedLanguage } from "@prisma/client";
import type {
    GetQuestionCategoriesDto,
    UpdateQuestionCategoryDto,
    GetQuestionTagsDto,
    UpdateQuestionTagDto,
    GetProgrammingLanguagesDto,
    UpdateProgrammingLanguageDto,
    CreateProgrammingLanguageDto,
    CreateDSASupportedLanguagesDto,
    DeleteDSASupportedLanguagesDto
} from "../dto/question.dto.js";
import { PaginationHelper } from "../../../common/helper/pagination.helper.js";
import { slugifyText } from "../../auth/utils/auth.utils.js";

function normalizeName(name: string): string {
    return name.toLowerCase().replace(/[\s\-_]+/g, "");
}

export class QuestionService {
    static async createQueCategory(
        name: string,
        parentId?: string | null
    ): Promise<QuestionCategory> {
        const parentIdValue = parentId ?? null;

        const siblingCategories = await QuestionRepository.getCategoriesByParent(parentIdValue);
        const normalizedName = normalizeName(name);
        const duplicate = siblingCategories.find(c => normalizeName(c.name) === normalizedName);

        if (duplicate)
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

            const siblingCategories = await QuestionRepository.getCategoriesByParent(targetParentId);
            const normalizedName = normalizeName(targetName);
            const duplicate = siblingCategories.find(c => normalizeName(c.name) === normalizedName && c.id !== id);
            if (duplicate) {
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

    static async createQuestionTag(name: string): Promise<QuestionTag> {
        const tags = await QuestionRepository.getAllTagsRaw();
        const normalizedName = normalizeName(name);
        const duplicate = tags.find(t => normalizeName(t.name) === normalizedName);
        if (duplicate) {
            throw new ConflictError(`Question tag "${name}" already exists`);
        }
        return await QuestionRepository.createQuestionTag(name);
    }

    static async getAllQuestionTags(filters: GetQuestionTagsDto): Promise<any> {
        const pagination = PaginationHelper.getPagination(filters);
        const totalItems = await QuestionRepository.countQuestionTags(filters);
        const tags = await QuestionRepository.getAllQuestionTags(filters, pagination);

        return PaginationHelper.buildResponse(
            tags,
            pagination,
            totalItems
        );
    }

    static async getQuestionTagById(id: string): Promise<QuestionTag> {
        const tag = await QuestionRepository.findQuestionTagById(id);
        if (!tag) {
            throw new NotFoundError("Question tag not found");
        }
        return tag;
    }

    static async updateQuestionTag(id: string, data: UpdateQuestionTagDto): Promise<QuestionTag> {
        const tag = await QuestionRepository.findQuestionTagById(id);
        if (!tag) {
            throw new NotFoundError("Question tag not found");
        }

        if (data.name !== undefined) {
            const tags = await QuestionRepository.getAllTagsRaw();
            const normalizedName = normalizeName(data.name);
            const duplicate = tags.find(t => normalizeName(t.name) === normalizedName && t.id !== id);
            if (duplicate) {
                throw new ConflictError(`Question tag "${data.name}" already exists`);
            }
        }

        return await QuestionRepository.updateQuestionTag(id, data.name || tag.name);
    }

    static async deleteQuestionTag(id: string): Promise<void> {
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

    // ProgrammingLanguage Services
    static async createProgrammingLanguage(dto: CreateProgrammingLanguageDto): Promise<ProgrammingLanguage> {
        const languages = await QuestionRepository.getAllLanguagesRaw();
        const normalizedName = normalizeName(dto.name);
        const duplicateByName = languages.find(l => normalizeName(l.name) === normalizedName);
        if (duplicateByName) {
            throw new ConflictError(`Programming language with name "${dto.name}" already exists`);
        }

        const generatedSlug = slugifyText(dto.name);
        const normalizedSlug = normalizeName(generatedSlug);
        const duplicateBySlug = languages.find(l => normalizeName(l.slug) === normalizedSlug);
        if (duplicateBySlug) {
            throw new ConflictError(`Programming language with slug "${generatedSlug}" already exists`);
        }

        return await QuestionRepository.createLanguage({
            name: dto.name,
            slug: generatedSlug,
            isActive: dto.isActive
        });
    }

    static async getAllProgrammingLanguages(filters: GetProgrammingLanguagesDto): Promise<any> {
        const pagination = PaginationHelper.getPagination(filters);
        const totalItems = await QuestionRepository.countLanguages(filters);
        const languages = await QuestionRepository.getAllLanguages(filters, pagination);

        return PaginationHelper.buildResponse(
            languages,
            pagination,
            totalItems
        );
    }

    static async getProgrammingLanguageById(id: string): Promise<ProgrammingLanguage> {
        const language = await QuestionRepository.findLanguageById(id);
        if (!language) {
            throw new NotFoundError("Programming language not found");
        }
        return language;
    }

    static async updateProgrammingLanguage(id: string, dto: UpdateProgrammingLanguageDto): Promise<ProgrammingLanguage> {
        const language = await QuestionRepository.findLanguageById(id);
        if (!language) {
            throw new NotFoundError("Programming language not found");
        }

        const languages = await QuestionRepository.getAllLanguagesRaw();
        let generatedSlug: string | undefined = undefined;

        if (dto.name !== undefined) {
            const normalizedName = normalizeName(dto.name);
            const duplicate = languages.find(l => normalizeName(l.name) === normalizedName && l.id !== id);
            if (duplicate) {
                throw new ConflictError(`Programming language with name "${dto.name}" already exists`);
            }

            generatedSlug = slugifyText(dto.name);
            const normalizedSlug = normalizeName(generatedSlug);
            const duplicateSlug = languages.find(l => normalizeName(l.slug) === normalizedSlug && l.id !== id);
            if (duplicateSlug) {
                throw new ConflictError(`Programming language with slug "${generatedSlug}" already exists`);
            }
        }

        return await QuestionRepository.updateLanguage(id, {
            name: dto.name,
            slug: generatedSlug,
            isActive: dto.isActive
        });
    }

    static async deleteProgrammingLanguage(id: string): Promise<void> {
        const language = await QuestionRepository.findLanguageById(id);
        if (!language) {
            throw new NotFoundError("Programming language not found");
        }

        const usageCount = await QuestionRepository.getLanguageUsageCount(id);
        if (usageCount > 0) {
            throw new ConflictError(`Cannot delete language "${language.name}" because it is currently used by ${usageCount} DSA question(s).`);
        }

        await QuestionRepository.deleteLanguage(id);
    }

    // DSASupportedLanguage Services
    static async createSupportedLanguages(dto: CreateDSASupportedLanguagesDto): Promise<any> {
        const dsaDetail = await QuestionRepository.findDsaDetailById(dto.dsaDetailId);
        if (!dsaDetail) {
            throw new NotFoundError("DSA Detail not found");
        }

        for (const langId of dto.programmingLanguageIds) {
            const language = await QuestionRepository.findLanguageById(langId);
            if (!language) {
                throw new NotFoundError(`Programming language with ID "${langId}" not found`);
            }
        }

        return await QuestionRepository.createSupportedLanguages(dto.dsaDetailId, dto.programmingLanguageIds);
    }

    static async syncSupportedLanguages(dto: CreateDSASupportedLanguagesDto): Promise<any> {
        const dsaDetail = await QuestionRepository.findDsaDetailById(dto.dsaDetailId);
        if (!dsaDetail) {
            throw new NotFoundError("DSA Detail not found");
        }

        for (const langId of dto.programmingLanguageIds) {
            const language = await QuestionRepository.findLanguageById(langId);
            if (!language) {
                throw new NotFoundError(`Programming language with ID "${langId}" not found`);
            }
        }

        return await QuestionRepository.syncSupportedLanguages(dto.dsaDetailId, dto.programmingLanguageIds);
    }

    static async deleteSupportedLanguages(dto: DeleteDSASupportedLanguagesDto): Promise<any> {
        const dsaDetail = await QuestionRepository.findDsaDetailById(dto.dsaDetailId);
        if (!dsaDetail) {
            throw new NotFoundError("DSA Detail not found");
        }

        return await QuestionRepository.deleteSupportedLanguages(dto.dsaDetailId, dto.programmingLanguageIds);
    }

    static async getSupportedLanguagesByDsaId(dsaDetailId: string): Promise<any[]> {
        const dsaDetail = await QuestionRepository.findDsaDetailById(dsaDetailId);
        if (!dsaDetail) {
            throw new NotFoundError("DSA Detail not found");
        }

        return await QuestionRepository.getSupportedLanguagesByDsaId(dsaDetailId);
    }
}