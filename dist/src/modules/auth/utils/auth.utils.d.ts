import type { AuthTokenPayload, AuthTokens } from "../interfaces/auth.interface.js";
export declare const slugifyText: (value: string) => string;
export declare const buildTokenPayload: (payload: AuthTokenPayload) => AuthTokenPayload;
export declare const buildAuthTokens: (payload: AuthTokenPayload) => AuthTokens;
export declare const getRefreshTokenExpiresAt: (refreshToken: string) => Date;
export declare const createUniqueSlugSeed: (value: string) => string;
//# sourceMappingURL=auth.utils.d.ts.map