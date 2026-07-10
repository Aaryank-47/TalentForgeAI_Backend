import type { CreateCompanyDto } from "../dto/company.dto.js";
import type { CompanyView } from "../repository/company.repository.js";
import { AuthRepository } from "../../auth/repositories/auth.repository.js";
import { CompanyRepository } from "../repository/company.repository.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { slugifyText } from "../../auth/utils/auth.utils.js";

export class CompanyService {
    static async createCompany(
        dto: CreateCompanyDto,
        userId: string
    ): Promise<CompanyView> {
        const user = await AuthRepository.findUserById(userId);
        if (!user) {
            throw new NotFoundError("Authenticated user not found.");
        }

        const slug = slugifyText(dto.companyName);

        const existing = await CompanyRepository.findCompanyBySlug(slug);
        if (existing) {
            throw new ConflictError(
                "A company with this name already exists. Please choose a different name."
            );
        }

        const newCompany = await CompanyRepository.createCompany({
            userId,
            companyName: dto.companyName,
            slug,
            companyEmail: dto.companyEmail,
            website: dto.website,
            phoneNumber: dto.phoneNumber,
        });

        return newCompany;
    }
}