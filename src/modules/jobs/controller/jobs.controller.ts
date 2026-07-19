import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { MESSAGE } from "../../../common/constants/messages.js";
import { createJobService } from "../services/jobs.services.js";
import type { Request, Response } from "express";
import { CompanyMemberRole } from "@prisma/client";
import type { CompanyIdParamDto } from "../../company/dto/company.dto.js";
import type { JobCreationDto, JobDetailsParamDto, JobUpdateDto } from "../../jobs/dto/jobs.dto.js"

export class JobController {
    static async createJob(
        req: Request,
        res: Response
    ) {
        const { companyId } = req.params as CompanyIdParamDto;
        const jobPayload = req.body as JobCreationDto;
        const userId = req.user.id as string;
        const role = req.companyMember!.role as CompanyMemberRole;
        const job = await createJobService.createJob(companyId, jobPayload, userId, role);

        res.status(HTTP_STATUS.CREATED).json({
            status: "success",
            message: MESSAGE.JOB_CREATED,
            data: job,
        });
    }

    static async listCompanyJobs(
        req: Request,
        res: Response
    ){
        const { companyId } = req.params as CompanyIdParamDto;
        const userId = req.user.id as string;
        const jobs = await createJobService.listCompanyJobs(companyId);

        res.status(HTTP_STATUS.OK).json({
            status: "success",
            message: MESSAGE.JOBS_LISTED,
            data: jobs,
        });
    }

    static async getJobDetails(
        req: Request,
        res: Response
    ) {
        const { companyId, jobId } = req.params as JobDetailsParamDto;
        const job = await createJobService.getJobDetails(companyId, jobId);

        res.status(HTTP_STATUS.OK).json({
            status: "success",
            message: MESSAGE.JOB_DETAILS_FETCHED,
            data: job
        });
    }

    static async updateJobDetails(
        req: Request,
        res: Response
    ) {
        const jobPayload = req.body as JobUpdateDto;
        const job = await createJobService.updateJobDetails(req.params as JobDetailsParamDto, jobPayload);

        res.status(HTTP_STATUS.OK).json({
            status: "success",
            message: MESSAGE.JOB_UPDATED,
            data: job
        });
    }
}