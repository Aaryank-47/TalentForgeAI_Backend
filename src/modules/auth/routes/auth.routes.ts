import { Router } from "express";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { AuthController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { CandidateDto } from "../dto/Candidate.dto.js";
import { RegisterEmployerDto } from "../dto/registerEmployer.dto.js";
import { RegisterCompanyOwnerDto } from "../dto/registerCompanyOwner.dto.js";

import { 
    loginRateLimiter,
    registerRateLimiter,
    forgotPasswordRateLimiter,
    verifyOtpRateLimiter,
    resendVerificationRateLimiter
 } from "../../../common/middleware/rateLimit.middleware.js";

const router = Router();

router.post(
    "/register",
    registerRateLimiter,
    validate(CandidateDto.registerUser, "body"),
    AuthController.registerUser
);

router.post(
    "/register/candidate",
    registerRateLimiter,
    validate(CandidateDto.registerCandidate, "body"),
    AuthController.registerCandidate
);

router.post(
    "/register/employer",
    registerRateLimiter,
    validate(RegisterEmployerDto.registerEmployer, "body"),
    AuthController.registerEmployer
);

router.post(
    "/register/company-owner",
    registerRateLimiter,
    validate(RegisterCompanyOwnerDto.registerCompanyOwner, "body"),
    AuthController.registerCompanyOwner
);

router.post(
    "/login",
    loginRateLimiter,
    validate(CandidateDto.login, "body"),
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
    validate(CandidateDto.logoutAllDevices, "body"),
    AuthController.logoutAllDevicesByEmail
)

router.get(
    "/me",
    authMiddleware,
    AuthController.getMe
)

router.post(
    "/change/password",
    authMiddleware,
    validate(CandidateDto.changePassword, "body"),
    AuthController.changePassword
)

router.post(
    "/forgot/password",
    forgotPasswordRateLimiter,
    validate(CandidateDto.forgotPassword, "body"),
    AuthController.forgotPassword
)

router.post(
    "/verify/otp",
    verifyOtpRateLimiter,
    validate(CandidateDto.verifyOtp, "body"),
    AuthController.verifyOtp
)

router.post(
    "/verify-email",
    resendVerificationRateLimiter,
    validate(CandidateDto.verifyEmail, "body"),
    AuthController.verifyEmail
)

router.post(
    "/resend-verification",
    resendVerificationRateLimiter,
    validate(CandidateDto.resendVerification, "body"),
    AuthController.resendVerificationEmail
)

export default router;

router.post(
    "/reset/password",
    validate(CandidateDto.resetPassword, "body"),
    AuthController.resetPassword
)