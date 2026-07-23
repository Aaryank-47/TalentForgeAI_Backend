import { ApplicationRepository } from "../repositories/application.repository.js";
import { CompanyRepository } from "../../company/repository/company.repository.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ForbiddenError } from "../../../common/errors/ForbiddenError.js";
import { ApplicationStatus } from "../../../common/enums/all_enums.js";

export class EmployerApplicationService {
    static async getJobApplications(
        userId: string,
        jobId: string,
        query: {
            page: number;
            limit: number;
            status?: string | undefined;
            search?: string | undefined;
        }
    ) {
        const job = await ApplicationRepository.getJob(jobId);
        if (!job) {
            throw new NotFoundError("Job not found");
        }

        const isMember = await CompanyRepository.findMemberByUserAndCompany(userId, job.companyId);
        if (!isMember) {
            throw new ForbiddenError("You do not have permission to view applications for this job");
        }

        const result = await ApplicationRepository.getJobApplications({
            jobId,
            page: query.page,
            limit: query.limit,
            status: query.status,
            search: query.search,
        });

        return result;
    }

    static async getJobApplicationDetails(userId: string, applicationId: string) {
        const application = await ApplicationRepository.getJobApplicationDetails(applicationId);
        if (!application || application.status === ApplicationStatus.WITHDRAWN) {
            throw new NotFoundError("Application not found");
        }

        const isMember = await CompanyRepository.findMemberByUserAndCompany(userId, application.job.companyId);
        if (!isMember) {
            throw new ForbiddenError("You do not have permission to view this application");
        }

        return application;
    }
}
