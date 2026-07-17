import type { NextFunction, Request, Response } from "express";
import type { Company } from "@prisma/client";
declare global {
    namespace Express {
        interface Request {
            company?: Company;
        }
    }
}
export declare const ensureActiveCompany: (req: Request<{
    companyId: string;
}>, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=ensureActiveCompany%20.Middleware.d.ts.map