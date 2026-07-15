import { CompanyMemberRole } from "@prisma/client";
import type { Request, Response, NextFunction } from "express";
export declare const authorizedCompanyMember: (...allowedRoles: CompanyMemberRole[]) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=allowCompanyRoles.middleware.d.ts.map