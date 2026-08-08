import { Router } from "express";
import { CandidateController } from "../controllers/candidate.controller.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { CandidateDto } from "../dto/candidate.dto.js";
import { AssessmentAttemptController } from "../../assessment/controllers/candidateAssessment.controller.js";
import { getAttemptsQuerySchema } from "../../assessment/dto/candidateAssessment.dto.js";

const candidatesRoutes = Router();

candidatesRoutes.get(
    "/me/assessment-attempts",
    authMiddleware,
    authorize("CANDIDATE"),
    validate(getAttemptsQuerySchema, "query"),
    AssessmentAttemptController.getCandidateAttempts
);

candidatesRoutes.get(
    "/:candidateId",
    authMiddleware,
    authorize("EMPLOYER", "ADMIN", "SUPER_ADMIN"),
    validate(CandidateDto.getPublicProfileParam, "params"),
    CandidateController.getPublicProfile
);

candidatesRoutes.get(
    "/:candidateId/resumes",
    authMiddleware,
    validate(CandidateDto.getPublicProfileParam, "params"),
    CandidateController.getCandidateResumes
);

export default candidatesRoutes;
