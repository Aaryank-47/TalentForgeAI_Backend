import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { ParsedQs } from "qs";
export declare function asyncHandler<P = Record<string, string>, ResBody = any, ReqBody = any, ReqQuery = ParsedQs, Locals extends Record<string, any> = Record<string, any>>(handler: (req: Request<P, ResBody, ReqBody, ReqQuery, Locals>, res: Response<ResBody, Locals>, next: NextFunction) => Promise<unknown>): RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>;
//# sourceMappingURL=asyncHandler.d.ts.map