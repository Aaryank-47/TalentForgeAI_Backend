import { randomUUID } from "node:crypto";
import type { JwtPayload as JsonWebTokenPayload } from "jsonwebtoken";
import { JwtHelper } from "../../../common/helper/jwt.helper.js";
import type { AuthTokenPayload, AuthTokens } from "../interfaces/auth.interface.js";

type DecodedJwtPayload = JsonWebTokenPayload & {
    exp?: number;
};

export const slugifyText = (value: string): string => {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

export const buildTokenPayload = (payload: AuthTokenPayload): AuthTokenPayload => {
    return {
        id: payload.id,
        email: payload.email,
        role: payload.role,
    };
};

export const buildAuthTokens = (payload: AuthTokenPayload): AuthTokens => {
    const tokenPayload = buildTokenPayload(payload);

    return {
        accessToken: JwtHelper.generateAccessToken(tokenPayload),
        refreshToken: JwtHelper.generateRefreshToken(tokenPayload),
    };
};

export const getRefreshTokenExpiresAt = (refreshToken: string): Date => {
    const decodedToken = JwtHelper.decodeToken(refreshToken) as DecodedJwtPayload;

    if (!decodedToken.exp) {
        throw new Error("Unable to determine refresh token expiry.");
    }

    return new Date(decodedToken.exp * 1000);
};

export const getResetPasswordTokenExpiresAt = (token: string): Date => {
    const decoded = JwtHelper.decodeToken(token) as DecodedJwtPayload;

    if (!decoded.exp) {
        throw new Error("Unable to determine token expiry.");
    }

    return new Date(decoded.exp * 1000);
};

export const createUniqueSlugSeed = (value: string): string => {
    const baseSlug = slugifyText(value);

    return baseSlug.length > 0 ? baseSlug : randomUUID().replace(/-/g, "");
};

export const genrateOTP = (): string => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
}
