import { Router } from "express";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { AuthController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import {
    registerCandidateDto,
    registerEmployerDto,
    registerCompanyOwnerDto,
    loginDto,
    logoutAllDevicesDto,
    changePasswordDto,
    forgotPasswordDto,
    verifyOtpDto,
    resetPasswordDto,
    verifyEmailDto,
    resendVerificationDto
} from "../validators/auth.validator.js";

import { 
    loginRateLimiter,
    registerRateLimiter,
    forgotPasswordRateLimiter,
    verifyOtpRateLimiter,
    resendVerificationRateLimiter
 } from "../../../common/middleware/rateLimit.middleware.js";

const router = Router();

router.post(
    "/register/candidate",
    registerRateLimiter,
    validate(registerCandidateDto, "body"),
    AuthController.registerCandidate
);

router.post(
    "/register/employer",
    registerRateLimiter,
    validate(registerEmployerDto, "body"),
    AuthController.registerEmployer
);

router.post(
    "/register/company-owner",
    registerRateLimiter,
    validate(registerCompanyOwnerDto, "body"),
    AuthController.registerCompanyOwner
);

router.post(
    "/login",
    loginRateLimiter,
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

router.post(
    "/change/password",
    authMiddleware,
    validate(changePasswordDto, "body"),
    AuthController.changePassword
)

router.post(
    "/forgot/password",
    forgotPasswordRateLimiter,
    validate(forgotPasswordDto, "body"),
    AuthController.forgotPassword
)

router.post(
    "/verify/otp",
    verifyOtpRateLimiter,
    validate(verifyOtpDto, "body"),
    AuthController.verifyOtp
)

router.post(
    "/verify-email",
    resendVerificationRateLimiter,
    validate(verifyEmailDto, "body"),
    AuthController.verifyEmail
)

router.post(
    "/resend-verification",
    resendVerificationRateLimiter,
    validate(resendVerificationDto, "body"),
    AuthController.resendVerificationEmail
)

export default router;

router.post(
    "/reset/password",
    validate(resetPasswordDto, "body"),
    AuthController.resetPassword
)