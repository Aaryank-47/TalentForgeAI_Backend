import type { InvitationTokenPayload } from "../interfaces/company.interface.js";
export declare class InvitationTokenHelper {
    private static readonly SECRET;
    private static readonly EXPIRES_IN;
    static generateToken(payload: Omit<InvitationTokenPayload, "issuedAt" | "expiration">): string;
    static verifyToken(token: string): InvitationTokenPayload;
}
//# sourceMappingURL=invitationToken.util.d.ts.map