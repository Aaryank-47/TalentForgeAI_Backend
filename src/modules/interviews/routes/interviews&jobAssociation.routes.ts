import { Router } from "express";
import { InterviewsController } from "../controller/interviews&jobAssociation.controller.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { createInterviewDto } from "../dto/interviews&jobAssociation.dto.js";
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

export default router;
