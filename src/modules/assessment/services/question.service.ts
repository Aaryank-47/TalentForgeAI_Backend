import { QuestionRepository } from "../repositories/question.repository.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { ForbiddenError } from "../../../common/errors/ForbiddenError.js";
import type { Question, QuestionCategory, QuestionTag, ProgrammingLanguage, DSASupportedLanguage } from "@prisma/client";
import type { QuestionWithRelations } from "../interfaces/question.interface.js";
import type {
    GetQuestionCategoriesDto,
    UpdateQuestionCategoryDto,
    GetQuestionTagsDto,
    UpdateQuestionTagDto,
    GetProgrammingLanguagesDto,
    UpdateProgrammingLanguageDto,
    CreateProgrammingLanguageDto,
    CreateDSASupportedLanguagesDto,
    DeleteDSASupportedLanguagesDto,
    CreateQuestionDto,
    UpdateQuestionDto,
    GetQuestionsQueryDto
} from "../dto/question.dto.js";
import { PaginationHelper } from "../../../common/helper/pagination.helper.js";
import { slugifyText } from "../../auth/utils/auth.utils.js";
import { normalizeName, validateQuestionAccess } from "../helper/question.helper.js";

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

    static async createQuestion(
        dto: CreateQuestionDto,
        user: any
    ): Promise<Question> {
        let createdByCompanyMemberId: string | null = null;

        if (dto.ownership === "GLOBAL") {
            if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
                throw new ForbiddenError("Only platform administrators can create global questions");
            }
            if (dto.companyId) {
                throw new ConflictError("Global questions cannot have a company ID");
            }
        } else if (dto.ownership === "COMPANY") {
            if (!dto.companyId) {
                throw new ConflictError("Company questions must specify a company ID");
            }
            const membership = await QuestionRepository.findCompanyMember(user.id, dto.companyId);
            if (!membership) {
                throw new ForbiddenError("You must be an active member of the company to create questions for it");
            }
            console.log("Membership found : ",membership);
        }

        if (dto.categoryId) {
            const category = await QuestionRepository.findQuestionCategoryById(dto.categoryId);
            if (!category) throw new NotFoundError("Category not found");
        }

        if (dto.tagIds && dto.tagIds.length > 0) {
            for (const tagId of dto.tagIds) {
                const tag = await QuestionRepository.findQuestionTagById(tagId);
                if (!tag) throw new NotFoundError(`Tag with ID "${tagId}" not found`);
            }
        }

        if (dto.type === "DSA" && dto.dsaDetail) {
            for (const langId of dto.dsaDetail.supportedLanguageIds) {
                const lang = await QuestionRepository.findLanguageById(langId);
                if (!lang) throw new NotFoundError(`Programming language with ID "${langId}" not found`);
            }
        }

        return await QuestionRepository.createQuestion(dto, user.id, createdByCompanyMemberId);
    }

    static async getAllQuestions(filters: GetQuestionsQueryDto): Promise<{ data: QuestionWithRelations[], pagination: any }> {
        const pagination = PaginationHelper.getPagination(filters);
        const totalItems = await QuestionRepository.countQuestions(filters);
        const items = await QuestionRepository.getAllQuestions(filters, pagination);

        return PaginationHelper.buildResponse(
            items,
            pagination,
            totalItems
        );
    }

    static async getQuestionById(id: string, user: any): Promise<QuestionWithRelations> {
        const question = await QuestionRepository.findQuestionById(id);
        if (!question) throw new NotFoundError("Question not found");

        await validateQuestionAccess(question, user, "read");
        return question;
    }

    static async updateQuestion(id: string, dto: UpdateQuestionDto, user: any): Promise<Question> {
        const question = await QuestionRepository.findQuestionById(id);
        if (!question) throw new NotFoundError("Question not found");

        await validateQuestionAccess(question, user, "write");

        if (dto.categoryId) {
            const category = await QuestionRepository.findQuestionCategoryById(dto.categoryId);
            if (!category) throw new NotFoundError("Category not found");
        }

        if (dto.tagIds && dto.tagIds.length > 0) {
            for (const tagId of dto.tagIds) {
                const tag = await QuestionRepository.findQuestionTagById(tagId);
                if (!tag) throw new NotFoundError(`Tag with ID "${tagId}" not found`);
            }
        }

        if (dto.dsaDetail) {
            for (const langId of dto.dsaDetail.supportedLanguageIds) {
                const lang = await QuestionRepository.findLanguageById(langId);
                if (!lang) throw new NotFoundError(`Programming language with ID "${langId}" not found`);
            }
        }

        return await QuestionRepository.updateQuestion(id, dto, user.id);
    }

    static async deleteQuestion(id: string, user: any): Promise<Question> {
        const question = await QuestionRepository.findQuestionById(id);
        if (!question) throw new NotFoundError("Question not found");

        await validateQuestionAccess(question, user, "write");
        return await QuestionRepository.softDeleteQuestion(id, user.id);
    }

    static async publishQuestion(id: string, user: any): Promise<Question> {
        const question = await QuestionRepository.findQuestionById(id);
        if (!question) throw new NotFoundError("Question not found");

        await validateQuestionAccess(question, user, "write");
        if (question.status === "PUBLISHED") {
            throw new ConflictError("Question is already published");
        }
        return await QuestionRepository.publishQuestion(id, user.id);
    }

    static async archiveQuestion(id: string, user: any): Promise<Question> {
        const question = await QuestionRepository.findQuestionById(id);
        if (!question) throw new NotFoundError("Question not found");

        await validateQuestionAccess(question, user, "write");
        if (question.status !== "PUBLISHED") {
            throw new ConflictError("Only published questions can be archived");
        }
        return await QuestionRepository.archiveQuestion(id, user.id);
    }

    static async duplicateQuestion(id: string, user: any): Promise<Question> {
        const question = await QuestionRepository.findQuestionById(id);
        if (!question) throw new NotFoundError("Question not found");

        await validateQuestionAccess(question, user, "read");

        const tagIds = question.tags.map((t: any) => t.tagId);

        let mcqDetail = null;
        if (question.type === "MCQ" && question.mcqDetail) {
            mcqDetail = {
                allowMultipleCorrectAnswers: question.mcqDetail.allowMultipleCorrectAnswers,
                negativeMarks: question.mcqDetail.negativeMarks,
                options: question.mcqDetail.options.map((opt: any) => ({
                    optionText: opt.optionText,
                    displayOrder: opt.displayOrder,
                    isCorrect: opt.isCorrect,
                }))
            };
        }

        let dsaDetail = null;
        if (question.type === "DSA" && question.dsaDetail) {
            dsaDetail = {
                starterCode: question.dsaDetail.starterCode,
                referenceSolution: question.dsaDetail.referenceSolution,
                memoryLimit: question.dsaDetail.memoryLimit,
                timeLimit: question.dsaDetail.timeLimit,
                supportedLanguageIds: question.dsaDetail.supportedLanguages.map((sl: any) => sl.programmingLanguageId),
                testCases: question.dsaDetail.testCases.map((tc: any) => ({
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    type: tc.type,
                    explanation: tc.explanation,
                    displayOrder: tc.displayOrder,
                }))
            };
        }

        let machineCodingDetail = null;
        if (question.type === "MACHINE_CODING" && question.machineCodingDetail) {
            machineCodingDetail = {
                repositoryTemplate: question.machineCodingDetail.repositoryTemplate,
                projectStructure: question.machineCodingDetail.projectStructure,
                techStack: question.machineCodingDetail.techStack,
                implementationInstructions: question.machineCodingDetail.implementationInstructions,
                evaluationGuidelines: question.machineCodingDetail.evaluationGuidelines,
            };
        }

        let projectDetail = null;
        if (question.type === "PROJECT" && question.projectDetail) {
            projectDetail = {
                requirements: question.projectDetail.requirements,
                submissionInstructions: question.projectDetail.submissionInstructions,
                deadlineHours: question.projectDetail.deadlineHours,
            };
        }

        const createDto: CreateQuestionDto = {
            title: `${question.title} (Copy)`,
            description: question.description,
            type: question.type,
            difficulty: question.difficulty,
            estimatedTime: question.estimatedTime,
            defaultMarks: question.defaultMarks,
            ownership: question.ownership,
            categoryId: question.categoryId,
            tagIds,
            companyId: question.companyId,
            mcqDetail,
            dsaDetail,
            machineCodingDetail,
            projectDetail
        };

        let createdByCompanyMemberId: string | null = null;
        if (question.ownership === "COMPANY" && question.companyId) {
            const membership = await QuestionRepository.findCompanyMember(user.id, question.companyId);
            if (membership) createdByCompanyMemberId = membership.id;
        }

        return await QuestionRepository.createQuestion(createDto, user.id, createdByCompanyMemberId);
    }
}