import type { UserRole } from "@prisma/client";
export interface JwtPayload {
    id: string;
    email: string;
    role: UserRole;
    companyId?: string | undefined;
}
//# sourceMappingURL=types.d.ts.map