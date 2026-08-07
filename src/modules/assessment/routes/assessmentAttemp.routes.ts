import { Router } from "express";
import { AssessmentAttemptController } from "../controllers/assessmentAttemp.controller.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { tokenParamSchema } from "../dto/assessmentAttemp.dto.js";

const router = Router();

router.post(
    "/invitation/:token/start",
    validate(tokenParamSchema, "params"),
    AssessmentAttemptController.startAssessment
);

export default router;
