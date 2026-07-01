import { ZodObject, ZodError, z } from 'zod';
import { ValidationError } from '../errors/ValidationError.js';
export const validate = (schema, target) => (req, res, next) => {
    try {
        req[target] = schema.parse(req[target]);
        next();
    }
    catch (error) {
        if (error instanceof ZodError) {
            throw new ValidationError("Validation Failed", z.treeifyError(error));
        }
        next(error);
    }
};
//# sourceMappingURL=validate.middleware.js.map