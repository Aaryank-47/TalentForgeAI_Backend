import { Router } from "express";
import { AssessmentBuilderController } from "../controllers/assessmentBuilder.controller.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { ensureActiveCompanyMember } from "../../../common/middleware/ensureActiveCompanyMember.middleware.js";
import { UserRole } from "@prisma/client";
import {
    createAssessmentSchema,
    updateAssessmentSchema,
    getAssessmentsQuerySchema,
    assessmentIdParamSchema,
    createAssessmentSectionSchema
} from "../dto/assessmentBuilder.dto.js";


const AssessmentRoutes = Router();

// Create Assessment
AssessmentRoutes.post(
    "/",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validate(createAssessmentSchema, "body"),
    ensureActiveCompanyMember,
    AssessmentBuilderController.createAssessment
);

// Get Assessments
AssessmentRoutes.get(
    "/",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validate(getAssessmentsQuerySchema, "query"),
    AssessmentBuilderController.getAssessments
);

// Get Assessment by ID
AssessmentRoutes.get(
    "/:assessmentId",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validate(assessmentIdParamSchema, "params"),
    ensureActiveCompanyMember,
    AssessmentBuilderController.getAssessmentById
);

// Update Assessment
AssessmentRoutes.patch(
    "/:assessmentId",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validate(assessmentIdParamSchema, "params"),
    validate(updateAssessmentSchema, "body"),
    ensureActiveCompanyMember,
    AssessmentBuilderController.updateAssessment
);

// Delete Assessment
AssessmentRoutes.delete(
    "/:assessmentId",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validate(assessmentIdParamSchema, "params"),
    ensureActiveCompanyMember,
    AssessmentBuilderController.deleteAssessment
);

// Publish Assessment
AssessmentRoutes.patch(
    "/:assessmentId/publish",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validate(assessmentIdParamSchema, "params"),
    ensureActiveCompanyMember,
    AssessmentBuilderController.publishAssessment
);

// Archive Assessment
AssessmentRoutes.patch(
    "/:assessmentId/archive",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validate(assessmentIdParamSchema, "params"),
    ensureActiveCompanyMember,
    AssessmentBuilderController.archiveAssessment
);

// Duplicate Assessment
AssessmentRoutes.post(
    "/:assessmentId/duplicate",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validate(assessmentIdParamSchema, "params"),
    ensureActiveCompanyMember,
    AssessmentBuilderController.duplicateAssessment
);

// Create Assessment Section
AssessmentRoutes.post(
    "/:assessmentId/sections",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validate(assessmentIdParamSchema, "params"),
    validate(createAssessmentSectionSchema, "body"),
    ensureActiveCompanyMember,
    AssessmentBuilderController.createAssessmentSection
);

// Get Assessment Sections
AssessmentRoutes.get(
    "/:assessmentId/sections",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validate(assessmentIdParamSchema, "params"),
    ensureActiveCompanyMember,
    AssessmentBuilderController.getAssessmentSections
);

export default AssessmentRoutes;


