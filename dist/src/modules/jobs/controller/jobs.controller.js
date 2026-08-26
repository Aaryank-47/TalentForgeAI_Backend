import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { MESSAGE } from "../../../common/constants/messages.js";
import { createJobService } from "../services/jobs.services.js";
import { CompanyMemberRole, JobStatus } from "@prisma/client";
export class JobController {
    static async createJob(req, res) {
        const { companyId } = req.params;
        const jobPayload = req.body;
        const userId = req.user.id;
        const role = req.companyMember.role;
        const job = await createJobService.createJob(companyId, jobPayload, userId, role);
        res.status(HTTP_STATUS.CREATED).json({
            status: "success",
            message: MESSAGE.JOB_CREATED,
            data: job,
        });
    }
    static async listCompanyJobs(req, res) {
        const { companyId } = req.params;
        const userId = req.user.id;
        const jobs = await createJobService.listCompanyJobs(companyId);
        res.status(HTTP_STATUS.OK).json({
            status: "success",
            message: MESSAGE.JOBS_LISTED,
            data: jobs,
        });
    }
    static async listPublishedJobs(req, res) {
        const { search, employmentType, workplaceType, location } = req.query;
        const jobs = await createJobService.listPublishedJobs({
            search: typeof search === "string" ? search : undefined,
            employmentType: typeof employmentType === "string" ? employmentType : undefined,
            workplaceType: typeof workplaceType === "string" ? workplaceType : undefined,
            location: typeof location === "string" ? location : undefined,
        });
        res.status(HTTP_STATUS.OK).json({
            status: "success",
            message: "Published jobs retrieved successfully",
            data: jobs,
        });
    }
    static async getPublicJobById(req, res) {
        const { jobId } = req.params;
        const job = await createJobService.getPublicJobById(jobId);
        res.status(HTTP_STATUS.OK).json({
            status: "success",
            message: "Job details retrieved successfully",
            data: job,
        });
    }
    static async getJobDetails(req, res) {
        const { companyId, jobId } = req.params;
        const job = await createJobService.getJobDetails(companyId, jobId);
        res.status(HTTP_STATUS.OK).json({
            status: "success",
            message: MESSAGE.JOB_DETAILS_FETCHED,
            data: job
        });
    }
    static async updateJobDetails(req, res) {
        const jobPayload = req.body;
        const job = await createJobService.updateJobDetails(req.params, jobPayload);
        res.status(HTTP_STATUS.OK).json({
            status: "success",
            message: MESSAGE.JOB_UPDATED,
            data: job
        });
    }
    static async updateJobStatus(req, res) {
        const { companyId, jobId } = req.params;
        const status = req.body.status;
        const job = await createJobService.updateJobStatus(companyId, jobId, status);
        res.status(HTTP_STATUS.OK).json({
            status: "success",
            message: MESSAGE.JOB_STATUS_UPDATED,
            data: job
        });
    }
    static async saveJob(req, res) {
        const userId = req.user.id;
        const jobId = req.params.jobId;
        const savedJob = await createJobService.saveJob(userId, jobId);
        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: "Job saved successfully",
            data: savedJob,
        });
    }
    static async unsaveJob(req, res) {
        const userId = req.user.id;
        const jobId = req.params.jobId;
        await createJobService.unsaveJob(userId, jobId);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Job removed from saved jobs successfully",
        });
    }
    static async getSavedJobs(req, res) {
        const userId = req.user.id;
        const savedJobs = await createJobService.getSavedJobs(userId);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Saved jobs fetched successfully",
            data: savedJobs,
        });
    }
}
//# sourceMappingURL=jobs.controller.js.map