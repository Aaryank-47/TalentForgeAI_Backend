import type { JobCreationDto } from "../dto/jobs.dto.js";
import type { JobView } from "../interfaces/jobs.interface.js"
import { CompanyRepository } from "../../company/repository/company.repository.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { AuthRepository } from "../../auth/repositories/auth.repository.js";
import { CompanyMemberRole, CompanyStatus } from "@prisma/client";

export class createJobService {
    static async createJob(
        jobPayload: JobCreationDto
    ): Promise<JobView> {
        return null as any;
    }
}
