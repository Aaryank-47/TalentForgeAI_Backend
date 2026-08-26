import { ApplicationRepository } from "../repositories/application.repository.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { BadRequestError } from "../../../common/errors/BadRequestError.js";
import { JobStatus, ApplicationStatus } from "../../../common/enums/all_enums.js";
import { AuthRepository } from "../../auth/repositories/auth.repository.js";
import { CandidateRepository } from "../../candidate/repository/candidate.repository.js";
import { ApplicationWorkflowRepository } from "../../hiring-workflow/repositories/application-workflow.repository.js";
export class ApplicationService {
    static async applyJob(resumeId, jobId, userId) {
        const resume = await ApplicationRepository.getResume(resumeId);
        if (!resume) {
            throw new NotFoundError("Resume not found");
        }
        const job = await ApplicationRepository.getJob(jobId);
        if (!job) {
            throw new NotFoundError("Job not found");
        }
        if (job.status != JobStatus.PUBLISHED) {
            throw new BadRequestError("Job is not open for application");
        }
        if (job.applicationDeadline && job.applicationDeadline < new Date()) {
            throw new BadRequestError("Application deadline has passed");
        }
        const candidateProfile = await AuthRepository.findProfileByUserId(userId);
        if (!candidateProfile || !candidateProfile.profile || !('isOpenToWork' in candidateProfile.profile)) {
            throw new NotFoundError('Candidate not found');
        }
        const alreadyApplied = await ApplicationRepository.getApplication(candidateProfile.profile.id, jobId);
        if (alreadyApplied) {
            throw new BadRequestError("You have already applied for this job");
        }
        const resumeBlonger = await CandidateRepository.findResumeBelongToUser(candidateProfile.profile.id, resumeId);
        if (!resumeBlonger) {
            throw new BadRequestError("Resume does not belong to you");
        }
        const newApplication = await ApplicationRepository.createApplication({
            candidateId: candidateProfile.profile.id,
            jobId: job.id,
            sourceResumeId: resume.id,
            fileName: resume.resumeName,
            fileUrl: resume.resumeUrl,
            fileSize: resume.fileSize,
            status: ApplicationStatus.APPLIED
        });
        let firstStage = null;
        if (job.workflowId) {
            firstStage = await ApplicationWorkflowRepository.getFirstWorkflowStage(job.workflowId);
        }
        else {
            firstStage = await ApplicationWorkflowRepository.getDefaultWorkflowStageForCompany(job.companyId);
        }
        if (firstStage) {
            await ApplicationWorkflowRepository.createApplicationWorkflow({
                applicationId: newApplication.id,
                workflowStageId: firstStage.id
            });
        }
        return newApplication;
    }
    static async getCandidateApplications(userId, filters) {
        const candidateProfile = await AuthRepository.findProfileByUserId(userId);
        if (!candidateProfile || !candidateProfile.profile || !('isOpenToWork' in candidateProfile.profile)) {
            throw new NotFoundError('Candidate not found');
        }
        const page = filters.page ? Math.max(1, filters.page) : 1;
        const limit = filters.limit ? Math.max(1, filters.limit) : 10;
        return await ApplicationRepository.getCandidateApplications({
            candidateId: candidateProfile.profile.id,
            page,
            limit,
            status: filters.status,
            search: filters.search,
        });
    }
    static async getCandidateApplicationDetails(userId, applicationId) {
        const candidateProfile = await AuthRepository.findProfileByUserId(userId);
        if (!candidateProfile || !candidateProfile.profile || !('isOpenToWork' in candidateProfile.profile)) {
            throw new NotFoundError('Candidate not found');
        }
        const application = await ApplicationRepository.getCandidateApplicationDetails(candidateProfile.profile.id, applicationId);
        if (!application) {
            throw new NotFoundError("Application not found");
        }
        return application;
    }
    static async withdrawApplication(userId, applicationId, status, withdrawReason) {
        const candidate = await AuthRepository.findProfileByUserId(userId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }
        const application = await ApplicationRepository.getCandidateApplicationDetails(candidate.profile.id, applicationId);
        if (!application) {
            throw new NotFoundError("Application not found");
        }
        if (application.status !== ApplicationStatus.APPLIED) {
            throw new BadRequestError("Application cannot be withdrawn");
        }
        await ApplicationRepository.updateApplicationStatus(applicationId, status, withdrawReason);
    }
}
//# sourceMappingURL=application.C.services.js.map