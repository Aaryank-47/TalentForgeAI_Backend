import type { AuthTokenPayload } from "../modules/auth/interfaces/auth.interface.js";
import { CompanyMemberRole, CompanyStatus, type Company } from "@prisma/client";

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
            company?: Company;
        };
    }
}

export { };