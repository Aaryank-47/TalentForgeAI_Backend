import type { NextFunction, Request, Response } from "express";
export declare const ensureActiveCompany: (req: Request<{
    companyId: string;
}>, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=ensureActiveCompany%20.Middleware.d.ts.map