import type { Request, Response } from "express";
import type {
    CreateQuestionCategoryDto,
    UpdateQuestionCategoryDto,
    CreateQuestionTagDto,
    UpdateQuestionTagDto,
    CreateProgrammingLanguageDto,
    UpdateProgrammingLanguageDto,
    CreateDSASupportedLanguagesDto,
    DeleteDSASupportedLanguagesDto,
    CreateQuestionDto,
    UpdateQuestionDto,
    GetQuestionsQueryDto
} from "../dto/question.dto.js";
import { QuestionService } from "../services/question.service.js";
import { asyncHandler } from "../../../common/helper/asyncHandler.js";
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { MESSAGE } from "../../../common/constants/messages.js";

export class QuestionController {
    static createCategory = asyncHandler(
        async (req: Request, res: Response) => {
            const dto = req.body as CreateQuestionCategoryDto;

            const category = await QuestionService.createQueCategory(dto.name, dto.parentId);

            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: MESSAGE.CATEGORY_CREATED,
                data: category,
            });
        }
    );
    
    static getAllQueCategories = asyncHandler(
        async (req: Request, res: Response) => {
            const result = await QuestionService.getAllQueCategories(req.query);
            
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.CATEGORY_FETCHED,
                data: result,
            });
        }
    );

    static getCategoryById = asyncHandler(
        async (req: Request, res: Response) => {
            const categoryId = req.params.categoryId as string;
            const category = await QuestionService.getCategoryById(categoryId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.CATEGORY_FETCHED,
                data: category,
            });
        }
    );

    static updateCategory = asyncHandler(
        async (req: Request, res: Response) => {
            const categoryId = req.params.categoryId as string;
            const dto = req.body as UpdateQuestionCategoryDto;

            const category = await QuestionService.updateQueCategory(categoryId, dto);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.CATEGORY_UPDATED,
                data: category,
            });
        }
    );

    static deleteCategory = asyncHandler(
        async (req: Request, res: Response) => {
            const categoryId = req.params.categoryId as string;

            await QuestionService.deleteQueCategory(categoryId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.CATEGORY_DELETED,
            });
        }
    );

    static createTag = asyncHandler(
        async (req: Request, res: Response) => {
            const dto = req.body as CreateQuestionTagDto;

            const tag = await QuestionService.createQuestionTag(dto.name);

            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: MESSAGE.TAG_CREATED,
                data: tag,
            });
        }
    );

    static getAllQuestionTags = asyncHandler(
        async (req: Request, res: Response) => {
            const result = await QuestionService.getAllQuestionTags(req.query);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.TAG_FETCHED,
                data: result,
            });
        }
    );

    static getQuestionTagById = asyncHandler(
        async (req: Request, res: Response) => {
            const tagId = req.params.id as string;
            const tag = await QuestionService.getQuestionTagById(tagId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.TAG_FETCHED,
                data: tag,
            });
        }
    );

    static updateQuestionTag = asyncHandler(
        async (req: Request, res: Response) => {
            const tagId = req.params.id as string;
            const dto = req.body as UpdateQuestionTagDto;

            const tag = await QuestionService.updateQuestionTag(tagId, dto);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.TAG_UPDATED,
                data: tag,
            });
        }
    );

    static deleteQuestionTag = asyncHandler(
        async (req: Request, res: Response) => {
            const tagId = req.params.id as string;

            await QuestionService.deleteQuestionTag(tagId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.TAG_DELETED,
            });
        }
    );

    // ProgrammingLanguage Controllers
    static createLanguage = asyncHandler(
        async (req: Request, res: Response) => {
            const dto = req.body as CreateProgrammingLanguageDto;
            const language = await QuestionService.createProgrammingLanguage(dto);

            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: MESSAGE.LANGUAGE_CREATED,
                data: language,
            });
        }
    );

    static getAllProgrammingLanguages = asyncHandler(
        async (req: Request, res: Response) => {
            const result = await QuestionService.getAllProgrammingLanguages(req.query);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.LANGUAGE_FETCHED,
                data: result,
            });
        }
    );

    static getProgrammingLanguageById = asyncHandler(
        async (req: Request, res: Response) => {
            const languageId = req.params.id as string;
            const language = await QuestionService.getProgrammingLanguageById(languageId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.LANGUAGE_FETCHED,
                data: language,
            });
        }
    );

    static updateProgrammingLanguage = asyncHandler(
        async (req: Request, res: Response) => {
            const languageId = req.params.id as string;
            const dto = req.body as UpdateProgrammingLanguageDto;
            const language = await QuestionService.updateProgrammingLanguage(languageId, dto);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.LANGUAGE_UPDATED,
                data: language,
            });
        }
    );

    static deleteProgrammingLanguage = asyncHandler(
        async (req: Request, res: Response) => {
            const languageId = req.params.id as string;
            await QuestionService.deleteProgrammingLanguage(languageId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.LANGUAGE_DELETED,
            });
        }
    );

    // DSASupportedLanguage Controllers
    static createSupportedLanguages = asyncHandler(
        async (req: Request, res: Response) => {
            const dto = req.body as CreateDSASupportedLanguagesDto;
            const result = await QuestionService.createSupportedLanguages(dto);

            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: MESSAGE.SUPPORTED_LANGUAGE_ADDED,
                data: result,
            });
        }
    );

    static syncSupportedLanguages = asyncHandler(
        async (req: Request, res: Response) => {
            const dto = req.body as CreateDSASupportedLanguagesDto;
            const result = await QuestionService.syncSupportedLanguages(dto);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.SUPPORTED_LANGUAGE_ADDED,
                data: result,
            });
        }
    );

    static deleteSupportedLanguages = asyncHandler(
        async (req: Request, res: Response) => {
            const dto = req.body as DeleteDSASupportedLanguagesDto;
            await QuestionService.deleteSupportedLanguages(dto);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.SUPPORTED_LANGUAGE_REMOVED,
            });
        }
    );

    static getSupportedLanguagesByDsaId = asyncHandler(
        async (req: Request, res: Response) => {
            const dsaDetailId = req.params.dsaDetailId as string;
            const list = await QuestionService.getSupportedLanguagesByDsaId(dsaDetailId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.SUPPORTED_LANGUAGE_FETCHED,
                data: list,
            });
        }
    );

    // Question Bank Controllers
    static createQuestion = asyncHandler(
        async (req: Request, res: Response) => {
            const dto = req.body as CreateQuestionDto;
            const result = await QuestionService.createQuestion(dto, req.user);

            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: "Question created successfully.",
                data: result,
            });
        }
    );

    static getAllQuestions = asyncHandler(
        async (req: Request, res: Response) => {
            const filters = req.query as unknown as GetQuestionsQueryDto;
            const result = await QuestionService.getAllQuestions(filters);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Questions fetched successfully.",
                data: result,
            });
        }
    );

    static getQuestionById = asyncHandler(
        async (req: Request, res: Response) => {
            const id = req.params.id as string;
            const result = await QuestionService.getQuestionById(id, req.user);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Question fetched successfully.",
                data: result,
            });
        }
    );

    static updateQuestion = asyncHandler(
        async (req: Request, res: Response) => {
            const id = req.params.id as string;
            const dto = req.body as UpdateQuestionDto;
            const result = await QuestionService.updateQuestion(id, dto, req.user);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Question updated successfully.",
                data: result,
            });
        }
    );

    static deleteQuestion = asyncHandler(
        async (req: Request, res: Response) => {
            const id = req.params.id as string;
            await QuestionService.deleteQuestion(id, req.user);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Question deleted successfully.",
            });
        }
    );

    static publishQuestion = asyncHandler(
        async (req: Request, res: Response) => {
            const id = req.params.id as string;
            const result = await QuestionService.publishQuestion(id, req.user);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Question published successfully.",
                data: result,
            });
        }
    );

    static archiveQuestion = asyncHandler(
        async (req: Request, res: Response) => {
            const id = req.params.id as string;
            const result = await QuestionService.archiveQuestion(id, req.user);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Question archived successfully.",
                data: result,
            });
        }
    );

    static duplicateQuestion = asyncHandler(
        async (req: Request, res: Response) => {
            const id = req.params.id as string;
            const result = await QuestionService.duplicateQuestion(id, req.user);

            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: "Question duplicated successfully.",
                data: result,
            });
        }
    );

    static removeTagFromQuestion = asyncHandler(
        async (req: Request, res: Response) => {
            const id = req.params.id as string;
            const tagId = req.params.tagId as string;
            await QuestionService.removeTagFromQuestion(id, tagId, req.user);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Tag removed from question successfully.",
            }); 
        }
    );
}
