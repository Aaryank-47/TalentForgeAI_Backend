import { Router } from "express";
import { QuestionController } from "../controllers/question.controller.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { QuestionCategoryDto } from "../dto/question.dto.js";
import { UserRole } from "@prisma/client";

const router = Router();

router.post(
    "/categories",
    authMiddleware,
    authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validate(QuestionCategoryDto.createCategory, "body"),
    QuestionController.createCategory
);

export default router;
