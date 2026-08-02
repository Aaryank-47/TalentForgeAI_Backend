import type { QuestionCategory, QuestionTag } from "@prisma/client";
import type { GetQuestionCategoriesDto, UpdateQuestionCategoryDto, GetQuestionTagsDto, UpdateQuestionTagDto } from "../dto/question.dto.js";
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
}
//# sourceMappingURL=question.service.d.ts.map