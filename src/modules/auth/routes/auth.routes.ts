import { Router } from "express";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { AuthController } from "../controllers/auth.controller.js";
import { registerCandidateDto, registerRecruiterDto, loginDto } from "../validators/auth.validator.js";

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

router.post(
    "/login",
    validate(loginDto, "body"),
    AuthController.login
);

router.post(
    "/new-refresh-token",
    AuthController.refreshToken
)

export default router;