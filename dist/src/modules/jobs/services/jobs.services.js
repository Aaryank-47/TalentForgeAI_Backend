import { CompanyRepository } from "../../company/repository/company.repository.js";
import { SlugHelper } from "../utils/jobs.utils.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ForbiddenError } from "../../../common/errors/ForbiddenError.js";
import { AuthRepository } from "../../auth/repositories/auth.repository.js";
import { CompanyMemberRole, CompanyStatus } from "@prisma/client";
import { JobsRepository } from "../repository/jobs.repository.js";
export class createJobService {
    static async createJob(jobPayload, userId) {
        const companyId = await CompanyRepository.findCompanyById(jobPayload.companyId);
        if (!companyId) {
            throw new NotFoundError("Company not found");
        }
        const membership = await CompanyRepository.findMemberByUserAndCompany(userId, jobPayload.companyId);
        if (!membership) {
            throw new ForbiddenError("You are not a member of this company.");
        }
        const allowedRoles = [
            CompanyMemberRole.OWNER,
            CompanyMemberRole.ADMIN,
            CompanyMemberRole.RECRUITER,
            CompanyMemberRole.HIRING_MANAGER,
        ];
        if (!allowedRoles.includes(membership.role)) {
            throw new ForbiddenError("You do not have permission to create jobs for this company.");
        }
        const createSlug = SlugHelper.generateUniqueJobSlug(jobPayload.title, companyId.companyName);
        const job = await JobsRepository.createJob(jobPayload, createSlug, userId);
        const author = await AuthRepository.findUserById(userId);
        if (!author) {
            throw new NotFoundError("Author user not found");
        }
        return {
            id: job.id,
            companyId: job.companyId,
            title: job.title,
            description: job.description,
            employmentType: job.employmentType,
            workplaceType: job.workplaceType,
            location: job.location ?? "",
            minExperience: job.minExperience,
            maxExperience: job.maxExperience,
            minimumSalary: job.minimumSalary ?? 0,
            maximumSalary: job.maximumSalary ?? 0,
            salaryPeriod: job.salaryPeriod ?? null,
            hideSalary: job.hideSalary,
            applicationDeadline: job.applicationDeadline ?? null,
            skills: job.skills,
            benefits: job.benefits,
            isPublished: job.status === "PUBLISHED",
            companyMemberRole: membership.role,
            author: author,
        };
    }
}
//# sourceMappingURL=jobs.services.js.map