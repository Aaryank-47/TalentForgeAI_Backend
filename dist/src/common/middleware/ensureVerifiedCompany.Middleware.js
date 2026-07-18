import { ConflictError } from "../errors/ConflictError.js";
export const ensureVerifiedCompany = (req, res, next) => {
    if (!req.company?.isVerified) {
        throw new ConflictError("Company must be verified.");
    }
    next();
};
//# sourceMappingURL=ensureVerifiedCompany.Middleware.js.map