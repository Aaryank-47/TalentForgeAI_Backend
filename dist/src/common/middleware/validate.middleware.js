import { ZodObject, ZodError, z } from 'zod';
import { ValidationError } from '../errors/ValidationError.js';
export const validate = (schema, target) => (req, res, next) => {
    try {
        const parsed = schema.parse(req[target]);
        Object.defineProperty(req, target, {
            value: parsed,
            writable: true,
            configurable: true,
            enumerable: true
        });
        next();
    }
    catch (error) {
        if (error instanceof ZodError) {
            console.error('Validation Error:', error);
            throw new ValidationError("Validation Failed", z.treeifyError(error));
        }
        next(error);
    }
};
//# sourceMappingURL=validate.middleware.js.map