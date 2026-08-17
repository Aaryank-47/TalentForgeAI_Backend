import { Router } from "express";
import { InterviewsController, JobInterviewsController, InterviewAssignmentsController, InterviewSessionsController, InterviewSessionParticipantsController } from "../controller/interviews.controller.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import {
    createInterviewDto,
    interviewListQueryDto,
    updateInterviewDto,
    attachInterviewToJobDto,
    reorderJobInterviewsDto,
    changeInterviewStatusDto,
    createInterviewAssignmentsDto,
    getInterviewAssignmentsQueryDto,
    createInterviewSessionDto,
    updateInterviewSessionDto,
    addSessionParticipantsDto
} from "../dto/interviews.dto.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { UserRole } from "@prisma/client"
import { loadCompanyMembership } from "../../../common/middleware/loadCompanyMembership.middleware.js";
import aiInterviewRoutes from "../AI-interview/routes/ai.interview.routes.js";

const router = Router();

router.post(
    "/:companyId/create/interview",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    loadCompanyMembership,
    validate(createInterviewDto, "body"),
    InterviewsController.createInterview
);

router.get(
    "/:companyId/interviews",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    loadCompanyMembership,
    validate(interviewListQueryDto, "query"),
    InterviewsController.getCompanyInterviews
);

router.get(
    "/:companyId/interviews/:interviewId",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    loadCompanyMembership,
    InterviewsController.getInterviewById
);

router.patch(
    "/:companyId/interviews/:interviewId",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    loadCompanyMembership,
    validate(updateInterviewDto, "body"),
    InterviewsController.updateInterview
);

router.patch(
    "/:companyId/interviews/:interviewId/status",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    loadCompanyMembership,
    validate(changeInterviewStatusDto, "body"),
    InterviewsController.changeInterviewStatus
);

// --- Job-Interview Association Routes --- //

router.post(
    "/:companyId/jobs/:jobId/interviews",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    loadCompanyMembership,
    validate(attachInterviewToJobDto, "body"),
    JobInterviewsController.attachInterview
);

router.get(
    "/company/:companyId/jobs/:jobId/interviews",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    loadCompanyMembership,
    JobInterviewsController.getInterviews
);

router.delete(
    "/company/:companyId/jobs/:jobId/interviews/:interviewId",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    loadCompanyMembership,
    JobInterviewsController.removeInterview
);

router.patch(
    "/company/:companyId/jobs/:jobId/interviews/order",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    loadCompanyMembership,
    validate(reorderJobInterviewsDto, "body"),
    JobInterviewsController.reorderInterviews
);

router.get(
    "/debug/job-interviews/all",
    JobInterviewsController.getAllJobInterviews
);

// --- Interview Assignments Routes --- //

router.post(
    "/:companyId/interviews/:interviewId/assignments",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    loadCompanyMembership,
    validate(createInterviewAssignmentsDto, "body"),
    InterviewAssignmentsController.createAssignments
);

router.get(
    "/:companyId/interviews/:interviewId/assignments",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    loadCompanyMembership,
    validate(getInterviewAssignmentsQueryDto, "query"),
    InterviewAssignmentsController.getAssignments
);

router.get(
    "/:companyId/interviews/:interviewId/assignments/:assignmentId",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    loadCompanyMembership,
    InterviewAssignmentsController.getAssignmentById
);

router.delete(
    "/:companyId/interviews/:interviewId/assignments/:assignmentId",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    loadCompanyMembership,
    InterviewAssignmentsController.deleteAssignment
);

// --- Interview Sessions Routes --- //

router.post(
    "/:companyId/interviews/:interviewId/sessions",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    loadCompanyMembership,
    validate(createInterviewSessionDto, "body"),
    InterviewSessionsController.createSession
);

router.get(
    "/:companyId/interviews/:interviewId/sessions",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    loadCompanyMembership,
    InterviewSessionsController.getSessions
);

router.get(
    "/:companyId/interview-sessions/:sessionId",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    loadCompanyMembership,
    InterviewSessionsController.getSessionById
);

router.patch(
    "/:companyId/interview-sessions/:sessionId",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    loadCompanyMembership,
    validate(updateInterviewSessionDto, "body"),
    InterviewSessionsController.updateSession
);

// --- Interview Session Participants Routes --- //

router.post(
    "/:companyId/interview-sessions/:sessionId/participants",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    loadCompanyMembership,
    validate(addSessionParticipantsDto, "body"),
    InterviewSessionParticipantsController.addParticipants
);

router.get(
    "/:companyId/interview-sessions/:sessionId/participants",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    loadCompanyMembership,
    InterviewSessionParticipantsController.getParticipants
);

router.delete(
    "/:companyId/interview-sessions/:sessionId/participants/:participantId",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    loadCompanyMembership,
    InterviewSessionParticipantsController.removeParticipant
);

router.use("/ai", aiInterviewRoutes);

export default router;

