import type { JobCreationDto } from "../dto/jobs.dto.js";
import type { JobView } from "../interfaces/jobs.interface.js"
import { CompanyRepository } from "../../company/repository/company.repository.js";
import { SlugHelper, toJobView } from "../utils/jobs.utils.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { AuthRepository } from "../../auth/repositories/auth.repository.js";
import { CompanyMemberRole } from "@prisma/client";
import { JobsRepository } from "../repository/jobs.repository.js";

export class createJobService {
    static async createJob(
        companyId: string,
        jobPayload: JobCreationDto,
        userId: string,
        companyMemberRole: CompanyMemberRole
    ): Promise<JobView> {
        const company = await CompanyRepository.findCompanyById(companyId);

        if (!company) {
            throw new NotFoundError("Company not found");
        }

        const createSlug = SlugHelper.generateUniqueJobSlug(
            jobPayload.title,
            company.companyName
        );

        const job = await JobsRepository.createJob(companyId, jobPayload, createSlug, userId);

        const author = await AuthRepository.findUserById(userId);
        if (!author) {
            throw new NotFoundError("Author user not found");
        }

        return toJobView(job, author, companyMemberRole);
    }
}

