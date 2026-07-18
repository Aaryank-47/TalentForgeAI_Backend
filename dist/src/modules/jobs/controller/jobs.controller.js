import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { MESSAGE } from "../../../common/constants/messages.js";
import { createJobService } from "../services/jobs.services.js";
import { CompanyMemberRole } from "@prisma/client";
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
            data: job,
        });
    }
}
//# sourceMappingURL=jobs.controller.js.map