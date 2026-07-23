import { ApplicationRepository } from "../repositories/application.C.repository.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { BadRequestError } from "../../../common/errors/BadRequestError.js";
import { JobStatus, ApplicationStatus } from "../../../common/enums/all_enums.js";
import { AuthRepository } from "../../auth/repositories/auth.repository.js";
import { CandidateRepository } from "../../candidate/repository/candidate.repository.js";
import type { ApplicationView } from "../interfaces/application.interface.js"

export class ApplicationService {
    static async applyJob(
        resumeId: string,
        jobId: string,
        userId: string
    ): Promise<ApplicationView> {
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

        const alreadyApplied = await ApplicationRepository.getApplication(
            candidateProfile.profile.id,
            jobId
        )
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
            resumeId: resume.id,
            status: ApplicationStatus.APPLIED
        })

        return newApplication;
    }

    static async getCandidateApplications(
        userId: string,
        filters: {
            page?: number | undefined;
            limit?: number | undefined;
            status?: string | undefined;
            search?: string | undefined;
        }
    ) {
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

    static async getCandidateApplicationDetails(
        userId: string,
        applicationId: string
    ) {
        const candidateProfile = await AuthRepository.findProfileByUserId(userId);
        if (!candidateProfile || !candidateProfile.profile || !('isOpenToWork' in candidateProfile.profile)) {
            throw new NotFoundError('Candidate not found');
        }

        const application = await ApplicationRepository.getCandidateApplicationDetails(
            candidateProfile.profile.id,
            applicationId
        );

        if (!application) {
            throw new NotFoundError("Application not found");
        }

        return application;
    }
}