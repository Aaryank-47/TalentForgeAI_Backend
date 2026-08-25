import { Router } from "express";
import { QuestionController } from "../controllers/question.controller.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { QuestionCategoryDto, QuestionTagDto, getQuestionTagsDto, ProgrammingLanguageDto, getProgrammingLanguagesDto, DSASupportedLanguageDto, createQuestionSchema, updateQuestionSchema, getQuestionsQuerySchema, questionIdParamsSchema } from "../dto/question.dto.js";
import { UserRole } from "@prisma/client";
const QuestionRoutes = Router();
const registerRoutes = (router, prefix) => {
    router.post(`${prefix}`, authMiddleware, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), validate(QuestionCategoryDto.createCategory, "body"), QuestionController.createCategory);
    router.get(`${prefix}`, authMiddleware, QuestionController.getAllQueCategories);
    router.get(`${prefix}/:categoryId`, authMiddleware, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EMPLOYER), validate(QuestionCategoryDto.categoryIdParams, "params"), QuestionController.getCategoryById);
    router.patch(`${prefix}/:categoryId`, authMiddleware, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), validate(QuestionCategoryDto.categoryIdParams, "params"), validate(QuestionCategoryDto.updateCategory, "body"), QuestionController.updateCategory);
    router.delete(`${prefix}/:categoryId`, authMiddleware, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), validate(QuestionCategoryDto.categoryIdParams, "params"), QuestionController.deleteCategory);
};
const registerTagRoutes = (router, prefix) => {
    router.post(`${prefix}`, authMiddleware, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EMPLOYER), validate(QuestionTagDto.createTag, "body"), QuestionController.createTag);
    router.get(`${prefix}`, authMiddleware, validate(getQuestionTagsDto, "query"), QuestionController.getAllQuestionTags);
    router.get(`${prefix}/:id`, authMiddleware, validate(QuestionTagDto.tagIdParams, "params"), QuestionController.getQuestionTagById);
    router.patch(`${prefix}/:id`, authMiddleware, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), validate(QuestionTagDto.tagIdParams, "params"), validate(QuestionTagDto.updateTag, "body"), QuestionController.updateQuestionTag);
    router.delete(`${prefix}/:id`, authMiddleware, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EMPLOYER), validate(QuestionTagDto.tagIdParams, "params"), QuestionController.deleteQuestionTag);
};
const registerLanguageRoutes = (router, prefix) => {
    router.post(`${prefix}`, authMiddleware, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EMPLOYER), validate(ProgrammingLanguageDto.createLanguage, "body"), QuestionController.createLanguage);
    router.get(`${prefix}`, authMiddleware, validate(getProgrammingLanguagesDto, "query"), QuestionController.getAllProgrammingLanguages);
    router.get(`${prefix}/:id`, authMiddleware, validate(ProgrammingLanguageDto.languageIdParams, "params"), QuestionController.getProgrammingLanguageById);
    router.patch(`${prefix}/:id`, authMiddleware, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), validate(ProgrammingLanguageDto.languageIdParams, "params"), validate(ProgrammingLanguageDto.updateLanguage, "body"), QuestionController.updateProgrammingLanguage);
    router.delete(`${prefix}/:id`, authMiddleware, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EMPLOYER), validate(ProgrammingLanguageDto.languageIdParams, "params"), QuestionController.deleteProgrammingLanguage);
};
const registerSupportedLanguageRoutes = (router, prefix) => {
    router.post(`${prefix}`, authMiddleware, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), validate(DSASupportedLanguageDto.createSupportedLanguages, "body"), QuestionController.createSupportedLanguages);
    router.put(`${prefix}`, authMiddleware, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), validate(DSASupportedLanguageDto.createSupportedLanguages, "body"), QuestionController.syncSupportedLanguages);
    router.delete(`${prefix}`, authMiddleware, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), validate(DSASupportedLanguageDto.deleteSupportedLanguages, "body"), QuestionController.deleteSupportedLanguages);
    router.get(`${prefix}/:dsaDetailId`, authMiddleware, QuestionController.getSupportedLanguagesByDsaId);
};
const registerQuestionBankRoutes = (router, prefix) => {
    router.post(`${prefix}`, authMiddleware, validate(createQuestionSchema, "body"), QuestionController.createQuestion);
    router.get(`${prefix}`, authMiddleware, validate(getQuestionsQuerySchema, "query"), QuestionController.getAllQuestions);
    router.get(`${prefix}:id`, authMiddleware, validate(questionIdParamsSchema, "params"), QuestionController.getQuestionById);
    router.patch(`${prefix}:id`, authMiddleware, validate(questionIdParamsSchema, "params"), validate(updateQuestionSchema, "body"), QuestionController.updateQuestion);
    router.delete(`${prefix}:id`, authMiddleware, validate(questionIdParamsSchema, "params"), QuestionController.deleteQuestion);
    router.patch(`${prefix}:id/publish`, authMiddleware, validate(questionIdParamsSchema, "params"), QuestionController.publishQuestion);
    router.patch(`${prefix}:id/archive`, authMiddleware, validate(questionIdParamsSchema, "params"), QuestionController.archiveQuestion);
    router.post(`${prefix}:id/duplicate`, authMiddleware, validate(questionIdParamsSchema, "params"), QuestionController.duplicateQuestion);
    router.delete(`${prefix}:id/tags/:tagId`, authMiddleware, QuestionController.removeTagFromQuestion);
};
// Register category routes under "/categories"
registerRoutes(QuestionRoutes, "/categories");
// Register tag routes under "/tags"
registerTagRoutes(QuestionRoutes, "/tags");
// Register language routes under "/languages"
registerLanguageRoutes(QuestionRoutes, "/languages");
// Register supported language routes under "/supported-languages"
registerSupportedLanguageRoutes(QuestionRoutes, "/supported-languages");
// Register main Question Bank routes at root level
registerQuestionBankRoutes(QuestionRoutes, "/");
export default QuestionRoutes;
//# sourceMappingURL=question.routes.js.map