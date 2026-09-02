import { ZodObject, ZodError, z } from 'zod';
import { ValidationError } from '../errors/ValidationError.js';
export const validate = (schema, target) => (req, res, next) => {
    try {
        const parsed = schema.parse(req[target]);
        Object.defineProperty(req, target, {
            value: { ...req[target], ...parsed },
            writable: true,
            configurable: true,
            enumerable: true
        });
        next();
    }
    catch (error) {
        if (error instanceof ZodError) {
            console.error('Validation Error:', error);
            console.error('Validation target:', target);
            console.error('Validation input data:', req[target]);
            throw new ValidationError("Validation Failed", z.treeifyError(error));
        }
        next(error);
    }
};
//# sourceMappingURL=validate.middleware.js.map