import type { JwtPayload } from "../types/types.js";
export declare class JwtHelper {
    static generateAccessToken(payload: JwtPayload): string;
    static generateRefreshToken(payload: JwtPayload): string;
    static verifyAccessToken(token: string): JwtPayload;
    static verifyRefreshToken(token: string): JwtPayload;
    static decodeToken(token: string): JwtPayload;
    static generateResetPasswordToken(payload: JwtPayload): string;
    static verifyResetPasswordToken(token: string): JwtPayload;
}
//# sourceMappingURL=jwt.helper.d.ts.map