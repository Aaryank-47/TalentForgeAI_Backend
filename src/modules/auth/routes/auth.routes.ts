import { Router } from "express";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { AuthController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { registerCandidateDto, registerRecruiterDto, loginDto, logoutAllDevicesDto } from "../validators/auth.validator.js";

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
);

router.post(
    "/logout",
    AuthController.logout
);

router.post(
    "/logout/all-devices",
    authMiddleware,
    AuthController.logoutAllDevices
)

router.post(
    "/deviceLimit/logout/all-devices",
    validate(logoutAllDevicesDto, "body"),
    AuthController.logoutAllDevicesByEmail
)

router.get(
    "/me",
    authMiddleware,
    AuthController.getMe
)

export default router;