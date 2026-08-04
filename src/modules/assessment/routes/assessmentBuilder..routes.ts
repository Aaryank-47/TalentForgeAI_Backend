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
    createAssessmentSectionSchema,
    sectionIdParamSchema,
    updateAssessmentSectionSchema,
    reorderSectionsSchema,
    addQuestionsToSectionSchema
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

AssessmentRoutes.patch(
    "/section/reorder",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validate(reorderSectionsSchema, "body"),
    ensureActiveCompanyMember,
    AssessmentBuilderController.reorderAssessmentSections
);

// Update Section
AssessmentRoutes.patch(
    "/section/:sectionId",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validate(sectionIdParamSchema, "params"),
    validate(updateAssessmentSectionSchema, "body"),
    ensureActiveCompanyMember,
    AssessmentBuilderController.updateAssessmentSection
);

// Delete Section
AssessmentRoutes.delete(
    "/section/:sectionId",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validate(sectionIdParamSchema, "params"),
    ensureActiveCompanyMember,
    AssessmentBuilderController.deleteAssessmentSection
);

// Add Questions to Section
AssessmentRoutes.post(
    "/section/:sectionId/questions",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validate(sectionIdParamSchema, "params"),
    validate(addQuestionsToSectionSchema, "body"),
    ensureActiveCompanyMember,
    AssessmentBuilderController.addQuestionsToSection
);

// Get Questions of a Section
AssessmentRoutes.get(
    "/section/:sectionId/questions",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    validate(sectionIdParamSchema, "params"),
    ensureActiveCompanyMember,
    AssessmentBuilderController.getSectionQuestions
);

export default AssessmentRoutes;


