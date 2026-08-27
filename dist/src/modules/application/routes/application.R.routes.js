import { Router } from "express";
import { EmployerApplicationController } from "../controller/application.R.controller.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { ApplicationDto } from "../dto/application.dto.js";
const recruiterApplicationRoutes = Router();
recruiterApplicationRoutes.get("/company/:companyId", authMiddleware, authorize("EMPLOYER", "ADMIN"), validate(ApplicationDto.companyIdParam, "params"), EmployerApplicationController.getCompanyApplications);
recruiterApplicationRoutes.get("/jobs/:jobId/applications", authMiddleware, authorize("EMPLOYER", "ADMIN"), validate(ApplicationDto.jobIdParam, "params"), EmployerApplicationController.getJobApplications);
recruiterApplicationRoutes.get("/:applicationId", authMiddleware, authorize("EMPLOYER", "ADMIN"), validate(ApplicationDto.applicationIdParam, "params"), EmployerApplicationController.getJobApplicationDetails);
export default recruiterApplicationRoutes;
//# sourceMappingURL=application.R.routes.js.map