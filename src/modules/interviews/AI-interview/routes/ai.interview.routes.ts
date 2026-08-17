import { Router } from "express";
import { AIInterviewController } from "../controllers/ai.interview.controller.js";
import { authMiddleware } from "../../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../../common/middleware/authorize.middleware.js";
import { loadCompanyMembership } from "../../../../common/middleware/loadCompanyMembership.middleware.js";
import { validate } from "../../../../common/middleware/validate.middleware.js";
import { generateFollowUpDto } from "../dto/ai.interview.dto.js";
import { UserRole } from "@prisma/client";

const router = Router();

router.post(
    "/:companyId/interview-sessions/:sessionId/generate-questions",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    loadCompanyMembership,
    AIInterviewController.generateQuestions
);

router.post(
    "/:companyId/interview-sessions/:sessionId/questions/:questionId/follow-up",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    loadCompanyMembership,
    validate(generateFollowUpDto, "body"),
    AIInterviewController.generateFollowUp
);

export default router;
