import { Router } from "express";
import { JobAssessmentController } from "../controllers/jobAssessment.controller.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { ensureActiveCompanyMember } from "../../../common/middleware/ensureActiveCompanyMember.middleware.js";
import { UserRole } from "@prisma/client";
import {
    attachAssessmentsToJobSchema,
    jobIdParamSchema,
    jobAssessmentIdParamSchema,
    reorderJobAssessmentsSchema
} from "../dto/jobAssessment.dto.js";

const router = Router();

router.post(
    "/:jobId/assessments",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validate(jobIdParamSchema, "params"),
    validate(attachAssessmentsToJobSchema, "body"),
    ensureActiveCompanyMember,
    JobAssessmentController.attachAssessmentsToJob
);

router.get(
    "/:jobId/assessments",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validate(jobIdParamSchema, "params"),
    ensureActiveCompanyMember,
    JobAssessmentController.getJobAssessments
);

router.patch(
    "/:jobId/assessments",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validate(jobIdParamSchema, "params"),
    validate(attachAssessmentsToJobSchema, "body"),
    ensureActiveCompanyMember,
    JobAssessmentController.updateJobAssessment
);

router.delete(
    "/:jobAssessmentId",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validate(jobAssessmentIdParamSchema, "params"),
    (req, res, next) => {
        const { jobAssessmentId } = req.params;
        if (typeof jobAssessmentId === "string" && jobAssessmentId.includes("_")) {
            const [jobId] = jobAssessmentId.split("_");
            if (jobId) {
                req.params.jobId = jobId;
            }
        }
        next();
    },
    ensureActiveCompanyMember,
    JobAssessmentController.removeJobAssessment
);

router.patch(
    "/reorder",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validate(reorderJobAssessmentsSchema, "body"),
    ensureActiveCompanyMember,
    JobAssessmentController.reorderJobAssessments
);

export default router;
