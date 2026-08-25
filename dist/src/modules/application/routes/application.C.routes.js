import { ApplicationController } from "../controller/application.C.controller.js";
import { Router } from "express";
import { ApplicationDto } from "../dto/application.dto.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { ensureCandidateProfile } from "../../../common/middleware/ensureCandidateProfile.middleware.js";
const applicationRoutes = Router();
applicationRoutes.post("/:jobId/apply/:resumeId", authMiddleware, ensureCandidateProfile, validate(ApplicationDto.applyJob, "params"), ApplicationController.applyJob);
applicationRoutes.get("/candidate/my/applications", authMiddleware, ensureCandidateProfile, ApplicationController.getCandidateApplications);
applicationRoutes.get("/candidate/my/application/:applicationId", authMiddleware, ensureCandidateProfile, ApplicationController.getCandidateApplicationDetails);
applicationRoutes.patch("/candidate/withdraw/:applicationId", authMiddleware, ensureCandidateProfile, validate(ApplicationDto.applicationIdParam, "params"), validate(ApplicationDto.withdrawApplication, "body"), ApplicationController.withdrawApplication);
export default applicationRoutes;
//# sourceMappingURL=application.C.routes.js.map