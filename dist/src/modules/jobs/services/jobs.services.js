import { CompanyRepository } from "../../company/repository/company.repository.js";
import { SlugHelper, toJobView } from "../utils/jobs.utils.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { AuthRepository } from "../../auth/repositories/auth.repository.js";
import { CompanyMemberRole } from "@prisma/client";
import { JobsRepository } from "../repository/jobs.repository.js";
export class createJobService {
    static async createJob(companyId, jobPayload, userId, companyMemberRole) {
        const company = await CompanyRepository.findCompanyById(companyId);
        if (!company) {
            throw new NotFoundError("Company not found");
        }
        const createSlug = SlugHelper.generateUniqueJobSlug(jobPayload.title, company.companyName);
        const job = await JobsRepository.createJob(companyId, jobPayload, createSlug, userId);
        const author = await AuthRepository.findUserById(userId);
        if (!author) {
            throw new NotFoundError("Author user not found");
        }
        return toJobView(job, author, companyMemberRole);
    }
    static async listCompanyJobs(companyId) {
        const company = await CompanyRepository.findCompanyById(companyId);
        if (!company) {
            throw new NotFoundError("Company not found");
        }
        const jobs = await JobsRepository.listCompanyJobs(companyId);
        return jobs;
    }
    static async getJobDetails(companyId, jobId) {
        const company = await CompanyRepository.findCompanyById(companyId);
        if (!company) {
            throw new NotFoundError("Company not found");
        }
        const job = await JobsRepository.findJobById(jobId);
        if (!job) {
            throw new NotFoundError("Job not found");
        }
        if (job.companyId !== companyId) {
            throw new NotFoundError("Job does not belong to this company");
        }
        return job;
    }
}
//# sourceMappingURL=jobs.services.js.map