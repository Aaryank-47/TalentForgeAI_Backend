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
            const parsed = schema.parse(req[target]);
            Object.defineProperty(req, target, {
                value: { ...req[target], ...parsed },
                writable: true,
                configurable: true,
                enumerable: true
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                console.error('Validation Error:', error);
                console.error('Validation target:', target);
                console.error('Validation input data:', req[target]);
                throw new ValidationError(
                    "Validation Failed",
                    z.treeifyError(error)
                );
            }
            next(error);
        }
    }
