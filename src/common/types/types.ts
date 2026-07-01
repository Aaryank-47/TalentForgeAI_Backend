import { UserRole } from "../enums/all_enums.js";

export interface JwtPayload {
    id: string;
    email: string;
    role: UserRole;
    companyId?: string;
}