import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { MESSAGE } from "../../../common/constants/messages.js";
import type { Request, Response } from "express";
import { EmployerApplicationService} from "../services/application.E.serices.js";
import { PaginationHelper } from "../../../common/helper/pagination.helper.js";
import { BadRequestError } from "../../../common/errors/BadRequestError.js";

export class EmployerApplicationController {
    static async getJobApplications(
        req: Request,
        res: Response
    ): Promise<void> {
        const userId = req.user.id;
        const { jobId } = req.params;
        const { status, search } = req.query;

        if (!jobId || typeof jobId !== "string") {
            throw new BadRequestError("Job ID is required");
        }

        const pagination = PaginationHelper.getPagination(req.query);

        const result = await EmployerApplicationService.getJobApplications(userId, jobId, {
            page: pagination.page,
            limit: pagination.limit,
            status: typeof status === "string" ? status : undefined,
            search: typeof search === "string" ? search : undefined,
        });

        const responseData = PaginationHelper.buildResponse(
            result.applications,
            pagination,
            result.total
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            statusCode: HTTP_STATUS.OK,
            message: MESSAGE.APPLICATION_FETCHED,
            ...responseData,
        });
    }

    static async getJobApplicationDetails(
        req: Request,
        res: Response
    ): Promise<void> {
        const userId = req.user.id;
        const { applicationId } = req.params;

        if (!applicationId) {
            throw new BadRequestError("Application ID is required");
        }

        const application = await EmployerApplicationService.getJobApplicationDetails(userId, applicationId as string);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            statusCode: HTTP_STATUS.OK,
            message: MESSAGE.APPLICATION_FETCHED,
            data: application,
        });
    }
}
