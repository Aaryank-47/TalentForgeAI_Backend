import { Router } from "express"
import { CandidateController } from "../controllers/candidate.controller.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { validate } from "../../../common/middleware/validate.middleware.js"
import { updateCandidateProfileDto } from "../dto/candidate.dto.js";


const candidateRoutes = Router();
candidateRoutes.get(
    "/me",
    authMiddleware,
    authorize("CANDIDATE"),
    CandidateController.getCandidateProfile
);
candidateRoutes.patch(
    "/me",
    authMiddleware,
    authorize("CANDIDATE"),
    validate(updateCandidateProfileDto, 'body'),
    CandidateController.updateCandidateProfile
);
export default candidateRoutes;