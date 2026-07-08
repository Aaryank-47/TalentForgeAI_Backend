import { rateLimit } from "express-rate-limit";
import { RATE_LIMIT } from "../constants/rateLimit.constants.js";
export const createRateLimiter = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            success: false,
            message,
        },
    });
};
export const loginRateLimiter = createRateLimiter(RATE_LIMIT.LOGIN.WINDOW_MS, RATE_LIMIT.LOGIN.MAX_REQUESTS, "Too many login attempts. Please try again after 15 minutes.");
export const registerRateLimiter = createRateLimiter(RATE_LIMIT.REGISTER.WINDOW_MS, RATE_LIMIT.REGISTER.MAX_REQUESTS, "Too many registration attempts.");
export const forgotPasswordRateLimiter = createRateLimiter(RATE_LIMIT.FORGOT_PASSWORD.WINDOW_MS, RATE_LIMIT.FORGOT_PASSWORD.MAX_REQUESTS, "Too many password reset requests.");
export const verifyOtpRateLimiter = createRateLimiter(RATE_LIMIT.VERIFY_OTP.WINDOW_MS, RATE_LIMIT.VERIFY_OTP.MAX_REQUESTS, "Too many OTP verification attempts.");
export const resendVerificationRateLimiter = createRateLimiter(RATE_LIMIT.RESEND_VERIFICATION.WINDOW_MS, RATE_LIMIT.RESEND_VERIFICATION.MAX_REQUESTS, "Too many resend verification requests.");
export const globalRateLimiter = createRateLimiter(RATE_LIMIT.GLOBAL.WINDOW_MS, RATE_LIMIT.GLOBAL.MAX_REQUESTS, "Too many requests.");
//# sourceMappingURL=rateLimit.middleware.js.map