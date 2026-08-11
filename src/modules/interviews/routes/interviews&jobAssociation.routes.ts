import { Router } from "express";
import { InterviewsController } from "../controller/interviews&jobAssociation.controller.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { 
    createInterviewDto,
    interviewListQueryDto,
    updateInterviewDto
} from "../dto/interviews&jobAssociation.dto.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { UserRole } from "@prisma/client"
import { loadCompanyMembership } from "../../../common/middleware/loadCompanyMembership.middleware.js";

const router = Router();

router.post(
    "/:companyId/create/interview",
    authMiddleware,
    authorize(UserRole.EMPLOYER,UserRole.ADMIN, UserRole.SUPER_ADMIN),
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

router.delete(
    "/:companyId/interviews/:interviewId",
    authMiddleware,
    authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
    loadCompanyMembership,
    InterviewsController.archiveInterview
);

export default router;
