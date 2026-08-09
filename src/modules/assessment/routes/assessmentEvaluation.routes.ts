import { Router } from "express";
import { AssessmentEvaluationController } from "../controllers/assessmentEvaluation.controller.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { attemptIdParamSchema } from "../dto/candidateAssessment.dto.js";
import { runCodeSchema, runCodeParamsSchema, manualEvaluationSchema } from "../dto/assessmentEvaluation.dto.js";
import { UserRole } from "@prisma/client";

const router = Router();

// Start Evaluation
router.post(
    "/:attemptId/evaluate",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validate(attemptIdParamSchema, "params"),
    AssessmentEvaluationController.startEvaluation
);

// Get Evaluation Status
router.get(
    "/:attemptId/evaluation",
    authMiddleware,
    authorize(UserRole.CANDIDATE, UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validate(attemptIdParamSchema, "params"),
    AssessmentEvaluationController.getEvaluationStatus
);

// Run Code
router.post(
    "/:attemptId/questions/:questionId/run",
    authMiddleware,
    authorize(UserRole.CANDIDATE),
    validate(runCodeParamsSchema, "params"),
    validate(runCodeSchema, "body"),
    AssessmentEvaluationController.runCode
);

// Manual Evaluation
router.post(
    "/:attemptId/questions/:questionId/evaluation",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validate(runCodeParamsSchema, "params"),
    validate(manualEvaluationSchema, "body"),
    AssessmentEvaluationController.evaluateQuestionManually
);

// Get Final Result
router.get(
    "/:attemptId/evaluation/result",
    authMiddleware,
    authorize(UserRole.CANDIDATE, UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validate(attemptIdParamSchema, "params"),
    AssessmentEvaluationController.getFinalResult
);

export default router;
