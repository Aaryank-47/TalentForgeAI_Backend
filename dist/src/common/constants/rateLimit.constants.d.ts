export declare const RATE_LIMIT: {
    readonly LOGIN: {
        readonly WINDOW_MS: number;
        readonly MAX_REQUESTS: 5;
    };
    readonly REGISTER: {
        readonly WINDOW_MS: number;
        readonly MAX_REQUESTS: 500;
    };
    readonly FORGOT_PASSWORD: {
        readonly WINDOW_MS: number;
        readonly MAX_REQUESTS: 3;
    };
    readonly VERIFY_OTP: {
        readonly WINDOW_MS: number;
        readonly MAX_REQUESTS: 5;
    };
    readonly RESEND_VERIFICATION: {
        readonly WINDOW_MS: number;
        readonly MAX_REQUESTS: 3;
    };
    readonly GLOBAL: {
        readonly WINDOW_MS: number;
        readonly MAX_REQUESTS: 100;
    };
};
//# sourceMappingURL=rateLimit.constants.d.ts.map