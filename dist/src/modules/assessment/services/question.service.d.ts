import type { Question, QuestionCategory, QuestionTag, ProgrammingLanguage } from "@prisma/client";
import type { QuestionWithRelations } from "../interfaces/question.interface.js";
import type { GetQuestionCategoriesDto, UpdateQuestionCategoryDto, GetQuestionTagsDto, UpdateQuestionTagDto, GetProgrammingLanguagesDto, UpdateProgrammingLanguageDto, CreateProgrammingLanguageDto, CreateDSASupportedLanguagesDto, DeleteDSASupportedLanguagesDto, CreateQuestionDto, UpdateQuestionDto, GetQuestionsQueryDto } from "../dto/question.dto.js";
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
    static createQuestion(dto: CreateQuestionDto, user: any): Promise<Question>;
    static getAllQuestions(filters: GetQuestionsQueryDto): Promise<{
        data: QuestionWithRelations[];
        pagination: any;
    }>;
    static getAllCompanyAndGlobalQuestions(user: any): Promise<{
        data: QuestionWithRelations[];
        pagination: any;
    }>;
    static getQuestionById(id: string, user: any): Promise<QuestionWithRelations>;
    static updateQuestion(id: string, dto: UpdateQuestionDto, user: any): Promise<Question>;
    static deleteQuestion(id: string, user: any): Promise<Question>;
    static publishQuestion(id: string, user: any): Promise<Question>;
    static archiveQuestion(id: string, user: any): Promise<Question>;
    static duplicateQuestion(id: string, user: any): Promise<Question>;
    static removeTagFromQuestion(questionId: string, tagId: string, user: any): Promise<void>;
}
//# sourceMappingURL=question.service.d.ts.map