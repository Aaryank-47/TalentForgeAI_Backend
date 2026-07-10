import type { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError, z } from 'zod';
import { ValidationError } from '../errors/ValidationError.js';

type ValidationTarget = 'body' | 'query' | 'params';

export const validate = (
    schema: ZodObject,
    target: ValidationTarget
) => (
    req: Request,
    res: Response,
    next: NextFunction
): void => {

        try {
            req[target] = schema.parse(req[target]);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                console.error('Validation Error:', error);
                throw new ValidationError(
                    "Validation Failed",
                    z.treeifyError(error)
                );
            }
            next(error);
        }
    }
