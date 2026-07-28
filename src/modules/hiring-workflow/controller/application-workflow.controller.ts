import type { Request, Response } from "express";
import { asyncHandler } from "../../../common/helper/asyncHandler.js";
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { ApiResponse } from "../../../common/utils/ApiResponse.js";
import { ApplicationWorkflowService } from "../services/application-workflow.service.js";

export class ApplicationWorkflowController {
    static createApplicationWorkflow = asyncHandler(
        async (
            req: Request,
            res: Response
        ) => {
            const { applicationId, workflowStageId } = req.body;
            const movedByUserId = (req as any).user.id;

            const applicationWorkflow = await ApplicationWorkflowService.createApplicationWorkflow(
                applicationId,
                workflowStageId,
                movedByUserId
            );

            res.status(HTTP_STATUS.CREATED).json(
                new ApiResponse(true, "Application workflow created successfully", applicationWorkflow)
            );
        }
    );
}