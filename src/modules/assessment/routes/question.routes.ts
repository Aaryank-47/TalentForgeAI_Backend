import { Router } from "express";
import { QuestionController } from "../controllers/question.controller.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { QuestionCategoryDto } from "../dto/question.dto.js";
import { UserRole } from "@prisma/client";

const QuestionRoutes = Router();

const registerRoutes = (router: Router, prefix: string) => {
    router.post(
        `${prefix}`,
        authMiddleware,
        authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
        validate(QuestionCategoryDto.createCategory, "body"),
        QuestionController.createCategory
    );

    router.get(
        `${prefix}`,
        authMiddleware,
        QuestionController.getAllQueCategories
    );

    router.get(
        `${prefix}/:categoryId`,
        authMiddleware,
        authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EMPLOYER),
        validate(QuestionCategoryDto.categoryIdParams, "params"),
        QuestionController.getCategoryById
    );

    router.patch(
        `${prefix}/:categoryId`,
        authMiddleware,
        authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
        validate(QuestionCategoryDto.categoryIdParams, "params"),
        validate(QuestionCategoryDto.updateCategory, "body"),
        QuestionController.updateCategory
    );

    router.delete(
        `${prefix}/:categoryId`,
        authMiddleware,
        authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
        validate(QuestionCategoryDto.categoryIdParams, "params"),
        QuestionController.deleteCategory
    );
};

// Register for /questions/categories (legacy prefix)
registerRoutes(QuestionRoutes, "/categories");

// Register for /assessment/question-categories
registerRoutes(QuestionRoutes, "");

export default QuestionRoutes;
