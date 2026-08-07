import { Router } from "express";
import { AssessmentAttemptController } from "../controllers/assessmentAttemp.controller.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { startAssessmentAttemptSchema } from "../dto/assessmentAttemp.dto.js";
import { UserRole } from "@prisma/client";

const router = Router();

router.post(
    "/start",
    authMiddleware,
    authorize(UserRole.CANDIDATE),
    validate(startAssessmentAttemptSchema, "body"),
    AssessmentAttemptController.startAssessment
);

router.get(
    "/:attemptId",
    authMiddleware,
    authorize(UserRole.CANDIDATE, UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    AssessmentAttemptController.getAttempt
);

router.patch(
    "/:attemptId/resume",
    authMiddleware,
    authorize(UserRole.CANDIDATE),
    AssessmentAttemptController.resumeAttempt
);

router.post(
    "/:attemptId/submit",
    authMiddleware,
    authorize(UserRole.CANDIDATE),
    AssessmentAttemptController.submitAttempt
);

export default router;
