import type { AuthTokenPayload } from "../modules/auth/interfaces/auth.interface.js";
import { CompanyMemberRole, CompanyStatus, type Company } from "@prisma/client";
import type { Socket } from "socket.io";

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

declare module "socket.io" {
    interface Socket {
        user?: {
            id: string,
            email: string,
            role: string
        };
        companyMember?: {
            id: string,
            userId: string,
            companyId: string,
            role: CompanyMemberRole;
            status: CompanyMemberStatus;
        };
        company?: Company;
    }
}

export { };