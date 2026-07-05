import type { UserRole } from "@prisma/client";

export interface JwtPayload {
    id: string;
    email: string;
    role: UserRole;
}