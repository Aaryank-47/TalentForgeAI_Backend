import { Router } from "express";
import { CandidateController } from "../controllers/candidate.controller.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { getPublicProfileParamDto } from "../dto/candidate.dto.js";

const candidatesRoutes = Router();

candidatesRoutes.get(
    "/:candidateId",
    authMiddleware,
    authorize("EMPLOYER", "ADMIN", "SUPER_ADMIN"),
    validate(getPublicProfileParamDto, "params"),
    CandidateController.getPublicProfile
);

candidatesRoutes.get(
    "/:candidateId/resumes",
    authMiddleware,
    validate(getPublicProfileParamDto, "params"),
    CandidateController.getCandidateResumes
);

export default candidatesRoutes;
