import jwt from "jsonwebtoken";
import { ApiError } from "../../../common/errors/ApiError.js";
import { UnauthorizedError } from "../../../common/errors/UnauthorizedError.js";
import { env } from "../../../config/env.js";
export class InvitationTokenHelper {
    static SECRET = env.jwt.invitationTokenSecret;
    static EXPIRES_IN = env.jwt.invitationTokenExpiresIn;
    static generateToken(payload) {
        const secret = this.SECRET;
        const expiresIn = this.EXPIRES_IN;
        if (!secret || !expiresIn) {
            throw new Error("INVITATION_TOKEN_SECRET or INVITATION_TOKEN_EXPIRES_IN not defined");
        }
        try {
            return jwt.sign({
                ...payload,
            }, secret, { expiresIn: expiresIn });
        }
        catch (error) {
            throw new ApiError(500, "Failed to generate invitation token.");
        }
    }
    static verifyToken(token) {
        const secret = this.SECRET;
        if (!secret) {
            throw new Error("INVITATION_TOKEN_SECRET not defined");
        }
        try {
            const decoded = jwt.verify(token, secret);
            return {
                companyId: decoded.companyId,
                inviteeEmail: decoded.inviteeEmail,
                invitedBy: decoded.invitedBy,
                role: decoded.role,
                issuedAt: decoded.iat,
                expiration: decoded.exp,
            };
        }
        catch (error) {
            throw new UnauthorizedError("Invalid or expired invitation token.");
        }
    }
}
//# sourceMappingURL=invitationToken.util.js.map