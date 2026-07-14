import type { AuthTokenPayload } from "../modules/auth/interfaces/auth.interface.js";

declare global {
    namespace Express {
        interface Request {
            user: AuthTokenPayload;
            companyMember?: {
                id: string;
                userId: string;
                companyId: string;
                role: CompanyMemberRole;
                status: CompanyMemberStatus;
            };
        };
    }
}

export { };