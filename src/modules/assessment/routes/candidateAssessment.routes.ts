import { Router } from "express";
import { AssessmentAttemptController } from "../controllers/candidateAssessment.controller.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { ensureCandidateProfile } from "../../../common/middleware/ensureCandidateProfile.middleware.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { 
    startAssessmentAttemptSchema, 
    saveAnswerParamsSchema, 
    saveAssessmentAnswerSchema, 
    attemptIdParamSchema 
} from "../dto/candidateAssessment.dto.js";

const router = Router();

router.post(
    "/start",
    authMiddleware,
    ensureCandidateProfile,
    validate(startAssessmentAttemptSchema, "body"),
    AssessmentAttemptController.startAssessment
);

router.get(
    "/:attemptId",
    authMiddleware,
    AssessmentAttemptController.getAttempt
);

router.patch(
    "/:attemptId/resume",
    authMiddleware,
    ensureCandidateProfile,
    AssessmentAttemptController.resumeAttempt
);

router.post(
    "/:attemptId/submit",
    authMiddleware,
    ensureCandidateProfile,
    AssessmentAttemptController.submitAttempt
);

router.put(
    "/:attemptId/answers/:questionId",
    authMiddleware,
    ensureCandidateProfile,
    validate(saveAnswerParamsSchema, "params"),
    validate(saveAssessmentAnswerSchema, "body"),
    AssessmentAttemptController.saveAnswer
);

router.get(
    "/:attemptId/answers/:questionId",
    authMiddleware,
    ensureCandidateProfile,
    validate(saveAnswerParamsSchema, "params"),
    AssessmentAttemptController.getAnswer
);

router.delete(
    "/:attemptId/answers/:questionId",
    authMiddleware,
    ensureCandidateProfile,
    validate(saveAnswerParamsSchema, "params"),
    AssessmentAttemptController.clearAnswer
);

router.get(
    "/:attemptId/answers",
    authMiddleware,
    ensureCandidateProfile,
    validate(attemptIdParamSchema, "params"),
    AssessmentAttemptController.getAnswers
);

export default router;
