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
}
//# sourceMappingURL=jobs.controller.js.map