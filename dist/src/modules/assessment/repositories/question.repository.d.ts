import type { QuestionCategory, QuestionTag, ProgrammingLanguage } from "@prisma/client";
import type { GetQuestionCategoriesDto, GetQuestionTagsDto, GetProgrammingLanguagesDto } from "../dto/question.dto.js";
import type { PaginationResult } from "../../../common/types/pagination.types.js";
export declare class QuestionRepository {
    static findQueCateogoryByName(name: string): Promise<QuestionCategory | null>;
    static findQueCategoryByNameAndParent(name: string, parentId: string | null): Promise<QuestionCategory | null>;
    static findQuestionCategoryById(id: string): Promise<QuestionCategory | null>;
    static createQueCategory(name: string, parentId?: string | null): Promise<QuestionCategory>;
    static updateQueCategory(id: string, data: {
        name?: string | undefined;
        displayOrder?: number | undefined;
        parentId?: string | null | undefined;
    }): Promise<QuestionCategory>;
    static softDeleteQueCategory(id: string): Promise<QuestionCategory>;
    static hasChildCategories(id: string): Promise<boolean>;
    static hasQuestions(id: string): Promise<boolean>;
    static countQuestionCategories(filters: GetQuestionCategoriesDto): Promise<number>;
    static getAllQueCategories(filters: GetQuestionCategoriesDto, pagination: PaginationResult): Promise<({
        parent: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            parentId: string | null;
            displayOrder: number;
        } | null;
        children: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            parentId: string | null;
            displayOrder: number;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        parentId: string | null;
        displayOrder: number;
    })[]>;
    static findQuestionTagByName(name: string): Promise<QuestionTag | null>;
    static findQuestionTagById(id: string): Promise<QuestionTag | null>;
    static createQuestionTag(name: string): Promise<QuestionTag>;
    static updateQuestionTag(id: string, name: string): Promise<QuestionTag>;
    static deleteQuestionTag(id: string): Promise<QuestionTag>;
    static getTagUsageCount(id: string): Promise<number>;
    static countQuestionTags(filters: GetQuestionTagsDto): Promise<number>;
    static getAllQuestionTags(filters: GetQuestionTagsDto, pagination: PaginationResult): Promise<QuestionTag[]>;
    static findLanguageByName(name: string): Promise<ProgrammingLanguage | null>;
    static findLanguageBySlug(slug: string): Promise<ProgrammingLanguage | null>;
    static findLanguageById(id: string): Promise<ProgrammingLanguage | null>;
    static createLanguage(data: {
        name: string;
        slug: string;
        isActive?: boolean;
    }): Promise<ProgrammingLanguage>;
    static updateLanguage(id: string, data: {
        name?: string | undefined;
        slug?: string | undefined;
        isActive?: boolean | undefined;
    }): Promise<ProgrammingLanguage>;
    static deleteLanguage(id: string): Promise<ProgrammingLanguage>;
    static getLanguageUsageCount(id: string): Promise<number>;
    static countLanguages(filters: GetProgrammingLanguagesDto): Promise<number>;
    static getAllLanguages(filters: GetProgrammingLanguagesDto, pagination: PaginationResult): Promise<ProgrammingLanguage[]>;
    static createSupportedLanguages(dsaDetailId: string, programmingLanguageIds: string[]): Promise<any>;
    static syncSupportedLanguages(dsaDetailId: string, programmingLanguageIds: string[]): Promise<any>;
    static deleteSupportedLanguages(dsaDetailId: string, programmingLanguageIds: string[]): Promise<any>;
    static getSupportedLanguagesByDsaId(dsaDetailId: string): Promise<({
        programmingLanguage: {
            slug: string;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
        };
    } & {
        createdAt: Date;
        dsaDetailId: string;
        programmingLanguageId: string;
    })[]>;
    static findDsaDetailById(id: string): Promise<{
        id: string;
        questionId: string;
        starterCode: string;
        referenceSolution: string;
        memoryLimit: number;
        timeLimit: number;
    } | null>;
    static getCategoriesByParent(parentId: string | null): Promise<QuestionCategory[]>;
    static getAllTagsRaw(): Promise<QuestionTag[]>;
    static getAllLanguagesRaw(): Promise<ProgrammingLanguage[]>;
}
//# sourceMappingURL=question.repository.d.ts.map