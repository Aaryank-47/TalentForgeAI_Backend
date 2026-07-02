import { randomUUID } from "node:crypto";
import { JwtHelper } from "../../../common/helper/jwt.helper.js";
export const slugifyText = (value) => {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
};
export const buildTokenPayload = (payload) => {
    return {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        ...(payload.companyId ? { companyId: payload.companyId } : {}),
    };
};
export const buildAuthTokens = (payload) => {
    const tokenPayload = buildTokenPayload(payload);
    return {
        accessToken: JwtHelper.generateAccessToken(tokenPayload),
        refreshToken: JwtHelper.generateRefreshToken(tokenPayload),
    };
};
export const getRefreshTokenExpiresAt = (refreshToken) => {
    const decodedToken = JwtHelper.decodeToken(refreshToken);
    if (!decodedToken.exp) {
        throw new Error("Unable to determine refresh token expiry.");
    }
    return new Date(decodedToken.exp * 1000);
};
export const createUniqueSlugSeed = (value) => {
    const baseSlug = slugifyText(value);
    return baseSlug.length > 0 ? baseSlug : randomUUID().replace(/-/g, "");
};
//# sourceMappingURL=auth.utils.js.map