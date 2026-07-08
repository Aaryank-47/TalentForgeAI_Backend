import type { Request, Response, NextFunction } from 'express';
import { UserRole } from "@prisma/client";
export declare const authorize: (...roles: UserRole[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=authorize.middleware.d.ts.map