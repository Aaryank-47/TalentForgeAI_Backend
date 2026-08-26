import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { MESSAGE } from "../../../common/constants/messages.js";
import { ApplicationService } from "../services/application.C.services.js";
import { ApplicationStatus } from "../../../common/enums/all_enums.js";
import { BadRequestError } from "../../../common/errors/BadRequestError.js";
import { PaginationHelper } from "../../../common/helper/pagination.helper.js";
export class ApplicationController {
    static async applyJob(req, res) {
        const { resumeId, jobId } = req.params;
        const userId = req.user.id;
        const newApplication = await ApplicationService.applyJob(resumeId, jobId, userId);
        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            statusCode: HTTP_STATUS.CREATED,
            message: MESSAGE.APPLICATION_APPLIED,
            data: newApplication,
        });
    }
    static async getCandidateApplications(req, res) {
        const userId = req.user.id;
        const { status, search } = req.query;
        const pagination = PaginationHelper.getPagination(req.query);
        const result = await ApplicationService.getCandidateApplications(userId, {
            page: pagination.page,
            limit: pagination.limit,
            status: typeof status === "string" ? status : undefined,
            search: typeof search === "string" ? search : undefined,
        });
        const responseData = PaginationHelper.buildResponse(result.applications, pagination, result.total);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            statusCode: HTTP_STATUS.OK,
            message: MESSAGE.APPLICATION_FETCHED,
            ...responseData,
        });
    }
    static async getCandidateApplicationDetails(req, res) {
        const userId = req.user.id;
        const { applicationId } = req.params;
        if (typeof applicationId !== "string") {
            throw new BadRequestError("Application ID is required");
        }
        const application = await ApplicationService.getCandidateApplicationDetails(userId, applicationId);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            statusCode: HTTP_STATUS.OK,
            message: MESSAGE.APPLICATION_FETCHED,
            data: application,
        });
    }
    static async withdrawApplication(req, res) {
        const userId = req.user.id;
        const { applicationId } = req.params;
        const { status, withdrawReason, remarks } = req.body;
        if (typeof applicationId !== "string") {
            throw new BadRequestError("Application ID is required");
        }
        const reason = withdrawReason || remarks || "Candidate requested withdrawal";
        const targetStatus = status || ApplicationStatus.WITHDRAWN;
        await ApplicationService.withdrawApplication(userId, applicationId, targetStatus, reason);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            statusCode: HTTP_STATUS.OK,
            message: MESSAGE.APPLICATION_WITHDRAWN,
        });
    }
}
//# sourceMappingURL=application.C.controller.js.map