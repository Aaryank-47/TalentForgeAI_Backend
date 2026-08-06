import crypto from "crypto";

export class TokenHelper {
    static generateSecureToken(): string {
        return crypto.randomBytes(32).toString("hex");
    }
}
