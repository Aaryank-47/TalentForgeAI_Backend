import type { Request, Response, NextFunction } from 'express';
import { UserRole } from "@prisma/client";
export declare const authorize: (...roles: UserRole[]) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
//# sourceMappingURL=authorize.middleware.d.ts.map