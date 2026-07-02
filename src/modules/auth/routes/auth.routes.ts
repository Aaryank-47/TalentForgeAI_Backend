import { Router } from "express";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { AuthController } from "../controllers/auth.controller.js";
import { registerCandidateDto, registerRecruiterDto } from "../validators/auth.validator.js";

const router = Router();

router.post(
    "/register/candidate",
    validate(registerCandidateDto, "body"),
    AuthController.registerCandidate
);

router.post(
    "/register/recruiter",
    validate(registerRecruiterDto, "body"),
    AuthController.registerRecruiter
);

export default router;