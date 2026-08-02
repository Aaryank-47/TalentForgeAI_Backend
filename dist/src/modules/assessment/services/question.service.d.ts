import type { QuestionCategory, QuestionTag, ProgrammingLanguage } from "@prisma/client";
import type { GetQuestionCategoriesDto, UpdateQuestionCategoryDto, GetQuestionTagsDto, UpdateQuestionTagDto, GetProgrammingLanguagesDto, UpdateProgrammingLanguageDto, CreateProgrammingLanguageDto, CreateDSASupportedLanguagesDto, DeleteDSASupportedLanguagesDto } from "../dto/question.dto.js";
export declare class QuestionService {
    static createQueCategory(name: string, parentId?: string | null): Promise<QuestionCategory>;
    static getAllQueCategories(filters: GetQuestionCategoriesDto): Promise<any>;
    static getCategoryById(id: string): Promise<QuestionCategory>;
    static updateQueCategory(id: string, data: UpdateQuestionCategoryDto): Promise<QuestionCategory>;
    static deleteQueCategory(id: string): Promise<void>;
    static createQuestionTag(name: string): Promise<QuestionTag>;
    static getAllQuestionTags(filters: GetQuestionTagsDto): Promise<any>;
    static getQuestionTagById(id: string): Promise<QuestionTag>;
    static updateQuestionTag(id: string, data: UpdateQuestionTagDto): Promise<QuestionTag>;
    static deleteQuestionTag(id: string): Promise<void>;
    static createProgrammingLanguage(dto: CreateProgrammingLanguageDto): Promise<ProgrammingLanguage>;
    static getAllProgrammingLanguages(filters: GetProgrammingLanguagesDto): Promise<any>;
    static getProgrammingLanguageById(id: string): Promise<ProgrammingLanguage>;
    static updateProgrammingLanguage(id: string, dto: UpdateProgrammingLanguageDto): Promise<ProgrammingLanguage>;
    static deleteProgrammingLanguage(id: string): Promise<void>;
    static createSupportedLanguages(dto: CreateDSASupportedLanguagesDto): Promise<any>;
    static syncSupportedLanguages(dto: CreateDSASupportedLanguagesDto): Promise<any>;
    static deleteSupportedLanguages(dto: DeleteDSASupportedLanguagesDto): Promise<any>;
    static getSupportedLanguagesByDsaId(dsaDetailId: string): Promise<any[]>;
}
//# sourceMappingURL=question.service.d.ts.map