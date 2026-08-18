import { Router } from "express";
import { AIInterviewController } from "../controllers/ai.interview.controller.js";
import { authMiddleware } from "../../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../../common/middleware/authorize.middleware.js";
import { loadCompanyMembership } from "../../../../common/middleware/loadCompanyMembership.middleware.js";
import { UserRole } from "@prisma/client";

const router = Router();

router.post(
    "/:companyId/interview-sessions/:sessionId/generate-questions",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    loadCompanyMembership,
    AIInterviewController.generateQuestions
);

router.get(
    "/:companyId/interview-sessions/:sessionId/ai-result",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    loadCompanyMembership,
    AIInterviewController.getFinalResult
);

export default router;
