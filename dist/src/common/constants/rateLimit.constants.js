export const RATE_LIMIT = {
    LOGIN: {
        WINDOW_MS: 15 * 60 * 1000,
        MAX_REQUESTS: 5,
    },
    REGISTER: {
        WINDOW_MS: 60 * 60 * 1000,
        MAX_REQUESTS: 500,
    },
    FORGOT_PASSWORD: {
        WINDOW_MS: 15 * 60 * 1000,
        MAX_REQUESTS: 3,
    },
    VERIFY_OTP: {
        WINDOW_MS: 10 * 60 * 1000,
        MAX_REQUESTS: 5,
    },
    RESEND_VERIFICATION: {
        WINDOW_MS: 10 * 60 * 1000,
        MAX_REQUESTS: 3,
    },
    GLOBAL: {
        WINDOW_MS: 15 * 60 * 1000,
        MAX_REQUESTS: 100,
    },
};
//# sourceMappingURL=rateLimit.constants.js.map