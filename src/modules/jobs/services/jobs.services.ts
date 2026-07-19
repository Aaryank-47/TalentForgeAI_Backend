import type { JobCreationDto, JobDetailsParamDto, JobUpdateDto } from "../dto/jobs.dto.js";
import type { JobView } from "../interfaces/jobs.interface.js"
import { CompanyRepository } from "../../company/repository/company.repository.js";
import { SlugHelper, toJobView } from "../utils/jobs.utils.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { AuthRepository } from "../../auth/repositories/auth.repository.js";
import { CompanyMemberRole, JobStatus } from "@prisma/client";
import { JobsRepository } from "../repository/jobs.repository.js";
import type { JobsListView } from "../../jobs/interfaces/jobs.interface.js"

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

    static async listCompanyJobs(
        companyId: string
    ): Promise<JobsListView[]> {
        const company = await CompanyRepository.findCompanyById(companyId);

        if (!company) {
            throw new NotFoundError("Company not found");
        }

        const jobs = await JobsRepository.listCompanyJobs(companyId);

        return jobs;
    }

    static async getJobDetails(
        companyId: string,
        jobId: string
    ): Promise<any> {
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

    static async updateJobDetails(
        params: JobDetailsParamDto,
        jobPayload: JobUpdateDto
    ): Promise<JobView> {
        const company = await CompanyRepository.findCompanyById(params.companyId);
        if (!company) {
            throw new NotFoundError("Company not found");
        }

        const job = await JobsRepository.findJobById(params.jobId);
        if (!job) {
            throw new NotFoundError("Job not found");
        }

        if (job.companyId !== params.companyId) {
            throw new NotFoundError("Job does not belong to this company");
        }

        const updateJobdetails = await JobsRepository.updateJobDetails(params.jobId, jobPayload);

        return updateJobdetails;
    }

    static async updateJobStatus(
        companyId: string,
        jobId: string,
        status: JobStatus
    ): Promise<JobView> {
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

        const updateJobdetails = await JobsRepository.updateJobStatus(jobId, status);

        return updateJobdetails;
    }
}

