import { Router } from "express";
import { EmployerApplicationController } from "../controller/application.R.controller.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { jobIdParamDto, applicationIdParamDto } from "../dto/application.dto.js";

const recruiterApplicationRoutes = Router();

recruiterApplicationRoutes.get(
    "/jobs/:jobId/applications",
    authMiddleware,
    authorize("EMPLOYER", "ADMIN"),
    validate(jobIdParamDto, "params"),
    EmployerApplicationController.getJobApplications
);

recruiterApplicationRoutes.get(
    "/:applicationId",
    authMiddleware,
    authorize("EMPLOYER", "ADMIN"),
    validate(applicationIdParamDto, "params"),
    EmployerApplicationController.getJobApplicationDetails
);

export default recruiterApplicationRoutes;
