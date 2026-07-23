import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { MESSAGE } from "../../../common/constants/messages.js";
import type { Request, Response } from "express";
import  { ApplicationService } from "../services/application.C.services.js";
import type { ApplyJobDto } from "../dto/application.dto.js"

export class ApplicationController {
    static async applyJob(
        req: Request<ApplyJobDto>,
        res: Response
    ): Promise<void> {
        const { resumeId, jobId } = req.params;
        const userId = req.user.id;

        const newApplication = await ApplicationService.applyJob(resumeId, jobId, userId);

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            statusCode: HTTP_STATUS.CREATED,
            message: MESSAGE.APPLICATION_APPLIED,
            data: newApplication,
        })
    }
}