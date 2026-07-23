import { ApplicationController } from "../controller/application.C.controller.js";
import { Router } from "express";
import {
    applyJobDto,
    withdrawApplicationDto,
    applicationIdParamDto
} from "../dto/application.dto.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { UserRole } from "../../../common/enums/all_enums.js";


const applicationRoutes = Router();

applicationRoutes.post(
    "/:jobId/apply/:resumeId",
    authMiddleware,
    authorize(UserRole.CANDIDATE),
    validate(applyJobDto, "params"),
    ApplicationController.applyJob
)

applicationRoutes.get(
    "/candidate/my/applications",
    authMiddleware,
    authorize(UserRole.CANDIDATE),
    ApplicationController.getCandidateApplications
)

applicationRoutes.get(
    "/candidate/my/application/:applicationId",
    authMiddleware,
    authorize(UserRole.CANDIDATE),
    ApplicationController.getCandidateApplicationDetails
)

applicationRoutes.patch(
    "/candidate/withdraw/:applicationId",
    authMiddleware,
    authorize(UserRole.CANDIDATE),
    validate(applicationIdParamDto, "params"),
    validate(withdrawApplicationDto, "body"),
    ApplicationController.withdrawApplication
)
export default applicationRoutes;