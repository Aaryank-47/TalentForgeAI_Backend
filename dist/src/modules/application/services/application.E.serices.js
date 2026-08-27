import { ApplicationRepository } from "../repositories/application.repository.js";
import { CompanyRepository } from "../../company/repository/company.repository.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ForbiddenError } from "../../../common/errors/ForbiddenError.js";
import { ApplicationStatus } from "../../../common/enums/all_enums.js";
export class EmployerApplicationService {
    static async getCompanyApplications(userId, companyId, query) {
        const isMember = await CompanyRepository.findMemberByUserAndCompany(userId, companyId);
        if (!isMember) {
            throw new ForbiddenError("You do not have permission to view applications for this company");
        }
        const result = await ApplicationRepository.getCompanyApplications({
            companyId,
            jobId: query.jobId,
            status: query.status,
            search: query.search,
            page: query.page,
            limit: query.limit,
        });
        return result;
    }
    static async getJobApplications(userId, jobId, query) {
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
    static async getJobApplicationDetails(userId, applicationId) {
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
//# sourceMappingURL=application.E.serices.js.map