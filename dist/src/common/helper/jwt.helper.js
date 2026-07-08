import jwt from "jsonwebtoken";
import env from "../../config/env.js";
export class JwtHelper {
    static generateAccessToken(payload) {
        return jwt.sign(payload, env.jwt.accessSecret, {
            expiresIn: env.jwt.accessExpiresIn
        });
    }
    static generateRefreshToken(payload) {
        return jwt.sign(payload, env.jwt.refreshSecret, {
            expiresIn: env.jwt.refreshExpiresIn
        });
    }
    static verifyAccessToken(token) {
        return jwt.verify(token, env.jwt.accessSecret);
    }
    static verifyRefreshToken(token) {
        return jwt.verify(token, env.jwt.refreshSecret);
    }
    static decodeToken(token) {
        return jwt.decode(token);
    }
    static generateResetPasswordToken(payload) {
        return jwt.sign(payload, env.jwt.resetPasswordSecret, {
            expiresIn: env.jwt.resetPasswordExpiresIn
        });
    }
    static verifyResetPasswordToken(token) {
        return jwt.verify(token, env.jwt.resetPasswordSecret);
    }
}
//# sourceMappingURL=jwt.helper.js.map