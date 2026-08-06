import { Router } from "express";
import { JobAssessmentController } from "../controllers/assessmentAssignment.controller.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { ensureActiveCompanyMember } from "../../../common/middleware/ensureActiveCompanyMember.middleware.js";
import { UserRole } from "@prisma/client";
import {
    attachAssessmentsToJobSchema,
    jobIdParamSchema,
    jobAssessmentIdParamSchema,
    reorderJobAssessmentsSchema,
    applicationIdParamSchema,
    createAssessmentInvitationSchema
} from "../dto/assessmentAssignment.dto.js";

const router = Router();

router.post(
    "/job/:jobId/assessments",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validate(jobIdParamSchema, "params"),
    validate(attachAssessmentsToJobSchema, "body"),
    ensureActiveCompanyMember,
    JobAssessmentController.attachAssessmentsToJob
);

router.get(
    "/job/:jobId/assessments",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validate(jobIdParamSchema, "params"),
    ensureActiveCompanyMember,
    JobAssessmentController.getJobAssessments
);

router.patch(
    "/job/:jobId/assessments",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validate(jobIdParamSchema, "params"),
    validate(attachAssessmentsToJobSchema, "body"),
    ensureActiveCompanyMember,
    JobAssessmentController.updateJobAssessment
);

router.delete(
    "/job/:jobAssessmentId",
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
    "/job/reorder",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validate(reorderJobAssessmentsSchema, "body"),
    ensureActiveCompanyMember,
    JobAssessmentController.reorderJobAssessments
);

router.post(
    "/applications/:applicationId/assessment-invitation",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validate(applicationIdParamSchema, "params"),
    validate(createAssessmentInvitationSchema, "body"),
    ensureActiveCompanyMember,
    JobAssessmentController.createAssessmentInvitation
);

export default router;
