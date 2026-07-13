import jwt from "jsonwebtoken";
import { ApiError } from "../../../common/errors/ApiError.js";
import { UnauthorizedError } from "../../../common/errors/UnauthorizedError.js";
import type { InvitationTokenPayload } from "../interfaces/company.interface.js";
import { env } from "../../../config/env.js";

export class InvitationTokenHelper {
    private static readonly SECRET = env.jwt.invitationTokenSecret;
    private static readonly EXPIRES_IN = env.jwt.invitationTokenExpiresIn;

    static generateToken(payload: Omit<InvitationTokenPayload, "issuedAt" | "expiration">): string {
        const secret = this.SECRET;
        const expiresIn = this.EXPIRES_IN;

        if (!secret || !expiresIn) {
            throw new Error("INVITATION_TOKEN_SECRET or INVITATION_TOKEN_EXPIRES_IN not defined");
        }
        try {
            return jwt.sign(
                {
                    ...payload,
                },
                secret,
                { expiresIn: expiresIn as any }
            );
        } catch (error) {
            throw new ApiError(500, "Failed to generate invitation token.");
        }
    }

    static verifyToken(token: string): InvitationTokenPayload {
        const secret = this.SECRET;
        if (!secret) {
            throw new Error("INVITATION_TOKEN_SECRET not defined");
        }
        try {
            const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
            return {
                companyId: decoded.companyId,
                inviteeEmail: decoded.inviteeEmail,
                invitedBy: decoded.invitedBy,
                role: decoded.role,
                issuedAt: decoded.iat,
                expiration: decoded.exp,
            };
        } catch (error) {
            throw new UnauthorizedError("Invalid or expired invitation token.");
        }
    }
}
