import type { Request, Response, NextFunction } from 'express';
import { ZodObject } from 'zod';
type ValidationTarget = 'body' | 'query' | 'params';
export declare const validate: (schema: ZodObject, target: ValidationTarget) => (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=validate.middleware.d.ts.map