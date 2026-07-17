import { CompanyRepository } from "../../modules/company/repository/company.repository.js";
import { ConflictError } from "../errors/ConflictError.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { CompanyStatus } from "@prisma/client";
export const ensureActiveCompany = async (req, res, next) => {
    const company = await CompanyRepository.getRawCompanyById(req.params.companyId);
    if (!company) {
        throw new NotFoundError("Company not found.");
    }
    if (company.deletedAt) {
        throw new ConflictError("Company has been deleted.");
    }
    if (company.status !== CompanyStatus.ACTIVE) {
        throw new ConflictError("Company is not active.");
    }
    req.company = company;
    next();
};
//# sourceMappingURL=ensureActiveCompany%20.Middleware.js.map