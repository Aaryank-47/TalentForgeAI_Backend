import { QuestionService } from "../services/question.service.js";
import { asyncHandler } from "../../../common/helper/asyncHandler.js";
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { MESSAGE } from "../../../common/constants/messages.js";
export class QuestionController {
    static createCategory = asyncHandler(async (req, res) => {
        const dto = req.body;
        const category = await QuestionService.createQueCategory(dto.name, dto.parentId);
        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: MESSAGE.CATEGORY_CREATED,
            data: category,
        });
    });
    static getAllQueCategories = asyncHandler(async (req, res) => {
        const result = await QuestionService.getAllQueCategories(req.query);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGE.CATEGORY_FETCHED,
            data: result,
        });
    });
    static getCategoryById = asyncHandler(async (req, res) => {
        const categoryId = req.params.categoryId;
        const category = await QuestionService.getCategoryById(categoryId);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGE.CATEGORY_FETCHED,
            data: category,
        });
    });
    static updateCategory = asyncHandler(async (req, res) => {
        const categoryId = req.params.categoryId;
        const dto = req.body;
        const category = await QuestionService.updateQueCategory(categoryId, dto);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGE.CATEGORY_UPDATED,
            data: category,
        });
    });
    static deleteCategory = asyncHandler(async (req, res) => {
        const categoryId = req.params.categoryId;
        await QuestionService.deleteQueCategory(categoryId);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGE.CATEGORY_DELETED,
        });
    });
    static createTag = asyncHandler(async (req, res) => {
        const dto = req.body;
        const tag = await QuestionService.createQuestionTag(dto.name);
        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: MESSAGE.TAG_CREATED,
            data: tag,
        });
    });
    static getAllQuestionTags = asyncHandler(async (req, res) => {
        const result = await QuestionService.getAllQuestionTags(req.query);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGE.TAG_FETCHED,
            data: result,
        });
    });
    static getQuestionTagById = asyncHandler(async (req, res) => {
        const tagId = req.params.id;
        const tag = await QuestionService.getQuestionTagById(tagId);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGE.TAG_FETCHED,
            data: tag,
        });
    });
    static updateQuestionTag = asyncHandler(async (req, res) => {
        const tagId = req.params.id;
        const dto = req.body;
        const tag = await QuestionService.updateQuestionTag(tagId, dto);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGE.TAG_UPDATED,
            data: tag,
        });
    });
    static deleteQuestionTag = asyncHandler(async (req, res) => {
        const tagId = req.params.id;
        await QuestionService.deleteQuestionTag(tagId);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGE.TAG_DELETED,
        });
    });
    // ProgrammingLanguage Controllers
    static createLanguage = asyncHandler(async (req, res) => {
        const dto = req.body;
        const language = await QuestionService.createProgrammingLanguage(dto);
        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: MESSAGE.LANGUAGE_CREATED,
            data: language,
        });
    });
    static getAllProgrammingLanguages = asyncHandler(async (req, res) => {
        const result = await QuestionService.getAllProgrammingLanguages(req.query);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGE.LANGUAGE_FETCHED,
            data: result,
        });
    });
    static getProgrammingLanguageById = asyncHandler(async (req, res) => {
        const languageId = req.params.id;
        const language = await QuestionService.getProgrammingLanguageById(languageId);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGE.LANGUAGE_FETCHED,
            data: language,
        });
    });
    static updateProgrammingLanguage = asyncHandler(async (req, res) => {
        const languageId = req.params.id;
        const dto = req.body;
        const language = await QuestionService.updateProgrammingLanguage(languageId, dto);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGE.LANGUAGE_UPDATED,
            data: language,
        });
    });
    static deleteProgrammingLanguage = asyncHandler(async (req, res) => {
        const languageId = req.params.id;
        await QuestionService.deleteProgrammingLanguage(languageId);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGE.LANGUAGE_DELETED,
        });
    });
    // DSASupportedLanguage Controllers
    static createSupportedLanguages = asyncHandler(async (req, res) => {
        const dto = req.body;
        const result = await QuestionService.createSupportedLanguages(dto);
        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: MESSAGE.SUPPORTED_LANGUAGE_ADDED,
            data: result,
        });
    });
    static syncSupportedLanguages = asyncHandler(async (req, res) => {
        const dto = req.body;
        const result = await QuestionService.syncSupportedLanguages(dto);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGE.SUPPORTED_LANGUAGE_ADDED,
            data: result,
        });
    });
    static deleteSupportedLanguages = asyncHandler(async (req, res) => {
        const dto = req.body;
        await QuestionService.deleteSupportedLanguages(dto);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGE.SUPPORTED_LANGUAGE_REMOVED,
        });
    });
    static getSupportedLanguagesByDsaId = asyncHandler(async (req, res) => {
        const dsaDetailId = req.params.dsaDetailId;
        const list = await QuestionService.getSupportedLanguagesByDsaId(dsaDetailId);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGE.SUPPORTED_LANGUAGE_FETCHED,
            data: list,
        });
    });
}
//# sourceMappingURL=question.controller.js.map