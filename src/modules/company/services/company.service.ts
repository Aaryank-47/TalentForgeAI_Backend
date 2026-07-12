import type { CreateCompanyDto, UpdateCompanyDto } from "../dto/company.dto.js";
import type { CompanyView } from "../repository/company.repository.js";
import { AuthRepository } from "../../auth/repositories/auth.repository.js";
import { CompanyRepository } from "../repository/company.repository.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ForbiddenError } from "../../../common/errors/ForbiddenError.js";
import { slugifyText } from "../../auth/utils/auth.utils.js";
import { calculateProfileCompletion, omitUndefined } from "../utils/company.utils.js";
import { CompanyMemberRole, UserRole } from "@prisma/client";


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

    static async getMyCompanies(
        userId: string
    ): Promise<CompanyView[]> {
        const user = await AuthRepository.findUserById(userId);
        if (!user) {
            throw new NotFoundError("Authenticated user not found.");
        }

        const companies = await CompanyRepository.getMyCompanies(userId);
        return companies;
    }

    static async getCompanyDetails(
        companyId: string
    ): Promise<CompanyView> {
        const company = await CompanyRepository.findCompanyById(companyId);
        if (!company) {
            throw new NotFoundError("Company not found.");
        }
        return company;
    }

    static async updateCompanyProfile(
        companyId: string,
        userId: string,
        dto: UpdateCompanyDto
    ): Promise<CompanyView> {
        const company = await CompanyRepository.getRawCompanyById(companyId);
        if (!company) {
            throw new NotFoundError("Company not found.");
        }

        const member = await CompanyRepository.findMemberByUserAndCompany(userId, companyId);
        if (
            !member ||
            (member.role !== CompanyMemberRole.OWNER && member.role !== CompanyMemberRole.ADMIN)
        ) {
            throw new ForbiddenError("You do not have permission to update this company.");
        }

        const merged = { ...company, ...dto };
        const profileCompletion = calculateProfileCompletion(merged as any);

        const updated = await CompanyRepository.updateCompanyProfile(
            companyId,
            omitUndefined({
                ...dto,
                profileCompletion,
            })
        );

        return updated;
    }

    static async deleteCompany(
        companyId: string,
        userId: string
    ): Promise<void> {
        const user = await AuthRepository.findUserById(userId);
        if (!user) {
            throw new NotFoundError("Authenticated user not found.");
        }
        if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.EMPLOYER) {
            throw new ForbiddenError("You do not have permission to delete this company.");
        }

        const company = await CompanyRepository.getRawCompanyById(companyId);
        if (!company) {
            throw new NotFoundError("Company not found.");
        }

        if (company.deletedAt) {
            throw new ConflictError("Company is already deleted.");
        }

        // Admins and Super Admins can bypass the membership check
        if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
            const membership = await CompanyRepository.membership(companyId, userId);
            
            if (!membership || (membership.role !== CompanyMemberRole.OWNER && membership.role !== CompanyMemberRole.ADMIN)) {
                throw new ForbiddenError("You do not have permission to delete this company.");
            }
        }

        await CompanyRepository.deleteCompany(companyId, userId);
    }
}