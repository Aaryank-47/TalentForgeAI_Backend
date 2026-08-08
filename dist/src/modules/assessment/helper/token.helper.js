import crypto from "crypto";
export class TokenHelper {
    static generateSecureToken() {
        return crypto.randomBytes(32).toString("hex");
    }
}
//# sourceMappingURL=token.helper.js.map