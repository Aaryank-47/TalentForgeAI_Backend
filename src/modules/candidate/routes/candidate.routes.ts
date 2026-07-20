import { Router } from "express"
import { CandidateController } from "../controllers/candidate.controller.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { validate } from "../../../common/middleware/validate.middleware.js"


const candidateRoutes = Router();
candidateRoutes.get(
    "/me",
    authMiddleware,
    authorize("CANDIDATE"),
    CandidateController.getCandidateProfile
);
export default candidateRoutes;