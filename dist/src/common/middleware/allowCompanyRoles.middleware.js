import { CompanyMemberRole } from "@prisma/client";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import { ForbiddenError } from "../errors/ForbiddenError.js";
export const authorizedCompanyMember = (...allowedRoles) => (req, res, next) => {
    if (!req.companyMember) {
        throw new UnauthorizedError("You are not authorized to access this resource.");
    }
    if (!allowedRoles.includes(req.companyMember.role)) {
        throw new ForbiddenError("You do not have permission to perform this action.");
    }
    next();
};
//# sourceMappingURL=allowCompanyRoles.middleware.js.map