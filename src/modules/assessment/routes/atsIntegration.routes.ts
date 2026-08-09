import { Router } from "express";
import { ATSIntegrationController } from "../controllers/atsIntegration.controller.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { applicationIdParamSchema } from "../dto/atsIntegration.dto.js";
import { UserRole } from "@prisma/client";

const router = Router();

router.get(
    "/:applicationId/assessment-result",
    authMiddleware,
    authorize(UserRole.CANDIDATE, UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validate(applicationIdParamSchema, "params"),
    ATSIntegrationController.getAssessmentResultByApplication
);

export default router;
