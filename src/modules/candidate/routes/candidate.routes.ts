import { Router } from "express"
import { CandidateController } from "../controllers/candidate.controller.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { validate } from "../../../common/middleware/validate.middleware.js"
import { updateCandidateProfileDto } from "../dto/candidate.dto.js";
import { upload, uploadFileToCloudinary } from "../../../common/uploads/index.js";

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
candidateRoutes.get(
    "/me/profile-completion",
    authMiddleware,
    authorize("CANDIDATE"),
    CandidateController.getProfileCompletion
);

candidateRoutes.post(
    "/me/resume",
    authMiddleware,
    authorize("CANDIDATE"),
    upload.single("resume"),
    CandidateController.uploadResume
)

candidateRoutes.get(
    "/me/resumes",
    authMiddleware,
    authorize("CANDIDATE"),
    CandidateController.getResumes
)
export default candidateRoutes;