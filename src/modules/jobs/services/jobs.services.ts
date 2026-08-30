import type { JobCreationDto, JobDetailsParamDto, JobUpdateDto } from "../dto/jobs.dto.js";
import type { JobView } from "../interfaces/jobs.interface.js"
import { CompanyRepository } from "../../company/repository/company.repository.js";
import { SlugHelper, toJobView } from "../utils/jobs.utils.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { AuthRepository } from "../../auth/repositories/auth.repository.js";
import { CompanyMemberRole, JobStatus, CompanyMemberStatus, Prisma } from "@prisma/client";
import type { JobMember } from "@prisma/client";
import { JobsRepository } from "../repository/jobs.repository.js";
import type { JobsListView, JobAssignedMemberView } from "../../jobs/interfaces/jobs.interface.js"
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { BadRequestError } from "../../../common/errors/BadRequestError.js";
import { ValidationError } from "../../../common/errors/ValidationError.js";
import { WorkflowRepository } from "../../hiring-workflow/repositories/workflow.repository.js";
import { MatchingEventsPublisher } from "../../matching/events/matching-events.publisher.js";

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

        const workflow = await WorkflowRepository.getWorkflowById(jobPayload.workflowId);
        if (!workflow) {
            throw new NotFoundError("Workflow not found");
        }

        if (workflow.companyId !== companyId) {
            throw new NotFoundError("Workflow does not belong to this company");
        }

        const job = await JobsRepository.createJob(companyId, jobPayload, createSlug, userId);

        if (job.status === JobStatus.PUBLISHED) {
            MatchingEventsPublisher.onJobMatchingDataChanged(job.id, ["PUBLISHED", "status"]).catch(() => {});
        }

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

    static async listPublishedJobs(params?: {
        search?: string | undefined;
        employmentType?: any;
        workplaceType?: any;
        location?: string | undefined;
    }): Promise<any[]> {
        return await JobsRepository.listPublishedJobs(params);
    }

    static async getPublicJobById(jobId: string): Promise<any> {
        const job = await JobsRepository.getPublicJobById(jobId);
        if (!job) {
            throw new NotFoundError("Job not found or not currently active");
        }
        return job;
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

        if(jobPayload.workflowId !== undefined){
            const workflow = await WorkflowRepository.getWorkflowById(jobPayload.workflowId);
            if (!workflow) {
                throw new NotFoundError("Workflow not found");
            }

            if (workflow.companyId !== params.companyId) {
                throw new NotFoundError("Workflow does not belong to this company");
            }
        }

        const job = await JobsRepository.findJobById(params.jobId);
        if (!job) {
            throw new NotFoundError("Job not found");
        }

        if (job.companyId !== params.companyId) {
            throw new NotFoundError("Job does not belong to this company");
        }

        if (job.status !== JobStatus.DRAFT) {
            throw new BadRequestError("Only jobs in DRAFT status can be edited. Published jobs cannot be modified.");
        }

        const updateJobdetails = await JobsRepository.updateJobDetails(params.jobId, jobPayload);

        MatchingEventsPublisher.onJobMatchingDataChanged(params.jobId, jobPayload as unknown as Record<string, any>).catch(() => {});

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

        if (status === JobStatus.PUBLISHED) {
            MatchingEventsPublisher.onJobMatchingDataChanged(jobId, ["PUBLISHED", "status"]).catch(() => {});
        }

        return updateJobdetails;
    }

    static async assignRecruiterToJob(
        jobId: string,
        recruiterId: string,
        companyId: string
    ):Promise<any> {
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

        const recruiter = await AuthRepository.findUserById(recruiterId);
        if (!recruiter) {
            throw new NotFoundError("Recruiter not found");
        }

        const recruiterMembership = await CompanyRepository.findMemberByUserAndCompany(recruiterId, companyId);
        if (!recruiterMembership) {
            throw new NotFoundError("Recruiter does not belong to this company");
        }

        const updateJobdetails = await JobsRepository.assignRecruiterToJob(jobId, recruiterMembership.id);

        return updateJobdetails;
    }

    static async assignCompanyMemberToJob(
        companyId: string,
        jobId: string,
        companyMemberId: string,
        assignedBy: string
    ): Promise<JobMember> {
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

        const member = await CompanyRepository.findCompanyMemberById(companyMemberId);
        if (!member) {
            throw new NotFoundError("Company Member not found");
        }

        if (member.companyId !== companyId) {
            throw new NotFoundError("Company Member does not belong to this company");
        }

        if (member.status !== CompanyMemberStatus.ACTIVE) {
            throw new ValidationError("Company Member is not active");
        }

        const existingAssignment = await JobsRepository.findJobAssignment(jobId, companyMemberId);
        if (existingAssignment) {
            throw new ConflictError("Member is already assigned to this job");
        }

        return JobsRepository.assignCompanyMemberToJob(jobId, companyMemberId, assignedBy);
    }

    static async listAssignedCompanyMembersForJob(
        companyId: string,
        jobId: string
    ): Promise<JobAssignedMemberView[]> {
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

        const assignments = await JobsRepository.listAssignedCompanyMembers(jobId);

        return assignments.map((assignment) => {
            const member = assignment.companyMember;
            const user = member.user;
            const profile = user.employer || user.candidate;

            return {
                companyMemberId: member.id,
                userId: user.id,
                fullName: profile?.fullName ?? "Unknown",
                email: user.email,
                role: member.role,
                profilePicture: profile?.profilePicture ?? null,
                joinedAt: member.joinedAt,
                assignedAt: assignment.createdAt,
            };
        });
    }

    static async removeAssignedCompanyMembersFromJob(
        companyId: string,
        jobId: string,
        companyMemberIds: string[]
    ): Promise<Prisma.BatchPayload> {
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

        for (const companyMemberId of companyMemberIds) {
            const existingAssignment = await JobsRepository.findJobAssignment(jobId, companyMemberId);
            if (!existingAssignment) {
                throw new NotFoundError(`Assignment not found for member: ${companyMemberId}`);
            }
        }

        return JobsRepository.removeAssignedCompanyMembers(jobId, companyMemberIds);
    }

    static async saveJob(userId: string, jobId: string) {
        const candidate = await AuthRepository.findProfileByUserId(userId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }

        const job = await JobsRepository.findJobById(jobId);
        if (!job || job.status !== JobStatus.PUBLISHED) {
            throw new NotFoundError('Published job not found');
        }

        return JobsRepository.saveJob(candidate.profile.id, jobId);
    }

    static async unsaveJob(userId: string, jobId: string) {
        const candidate = await AuthRepository.findProfileByUserId(userId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }

        return JobsRepository.unsaveJob(candidate.profile.id, jobId);
    }

    static async getSavedJobs(userId: string) {
        const candidate = await AuthRepository.findProfileByUserId(userId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }

        return JobsRepository.getSavedJobs(candidate.profile.id);
    }
}

