import { CompanyRepository } from "../../company/repository/company.repository.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { AuthRepository } from "../../auth/repositories/auth.repository.js";
import { CompanyMemberRole, CompanyStatus } from "@prisma/client";
export class createJobService {
    static async createJob(jobPayload, companyId) {
        const company = await CompanyRepository.getRawCompanyById(companyId);
        if (!company) {
            throw new NotFoundError("Company not found.");
        }
        if (company.deletedAt) {
            throw new ConflictError("Company has been deleted.");
        }
        if (company.status !== CompanyStatus.ACTIVE) {
            throw new ConflictError("Company is not active.");
        }
        if (!company.isVerified) {
            throw new ConflictError("Company must be verified before posting jobs.");
        }
    }
}
//# sourceMappingURL=jobs.services.js.map