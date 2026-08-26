import { CompanyRepository } from "../../company/repository/company.repository.js";
import { SlugHelper, toJobView } from "../utils/jobs.utils.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { AuthRepository } from "../../auth/repositories/auth.repository.js";
import { CompanyMemberRole, JobStatus, CompanyMemberStatus, Prisma } from "@prisma/client";
import { JobsRepository } from "../repository/jobs.repository.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { BadRequestError } from "../../../common/errors/BadRequestError.js";
import { ValidationError } from "../../../common/errors/ValidationError.js";
import { WorkflowRepository } from "../../hiring-workflow/repositories/workflow.repository.js";
export class createJobService {
    static async createJob(companyId, jobPayload, userId, companyMemberRole) {
        const company = await CompanyRepository.findCompanyById(companyId);
        if (!company) {
            throw new NotFoundError("Company not found");
        }
        const createSlug = SlugHelper.generateUniqueJobSlug(jobPayload.title, company.companyName);
        const workflow = await WorkflowRepository.getWorkflowById(jobPayload.workflowId);
        if (!workflow) {
            throw new NotFoundError("Workflow not found");
        }
        if (workflow.companyId !== companyId) {
            throw new NotFoundError("Workflow does not belong to this company");
        }
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
    static async listPublishedJobs(params) {
        return await JobsRepository.listPublishedJobs(params);
    }
    static async getPublicJobById(jobId) {
        const job = await JobsRepository.getPublicJobById(jobId);
        if (!job) {
            throw new NotFoundError("Job not found or not currently active");
        }
        return job;
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
    static async updateJobDetails(params, jobPayload) {
        const company = await CompanyRepository.findCompanyById(params.companyId);
        if (!company) {
            throw new NotFoundError("Company not found");
        }
        if (jobPayload.workflowId !== undefined) {
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
        return updateJobdetails;
    }
    static async updateJobStatus(companyId, jobId, status) {
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
    static async assignRecruiterToJob(jobId, recruiterId, companyId) {
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
    static async assignCompanyMemberToJob(companyId, jobId, companyMemberId, assignedBy) {
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
    static async listAssignedCompanyMembersForJob(companyId, jobId) {
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
    static async removeAssignedCompanyMembersFromJob(companyId, jobId, companyMemberIds) {
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
    static async saveJob(userId, jobId) {
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
    static async unsaveJob(userId, jobId) {
        const candidate = await AuthRepository.findProfileByUserId(userId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }
        return JobsRepository.unsaveJob(candidate.profile.id, jobId);
    }
    static async getSavedJobs(userId) {
        const candidate = await AuthRepository.findProfileByUserId(userId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }
        return JobsRepository.getSavedJobs(candidate.profile.id);
    }
}
//# sourceMappingURL=jobs.services.js.map