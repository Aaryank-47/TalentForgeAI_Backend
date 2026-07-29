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

    static getHiringBoard = asyncHandler(
        async (
            req: Request,
            res: Response
        ) => {
            const { jobId } = req.params;

            const board = await ApplicationWorkflowService.getHiringBoard(jobId as string);

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, "Hiring board retrieved successfully", board)
            );
        }
    );

    static moveApplicationToNextStage = asyncHandler(
        async (
            req: Request,
            res: Response
        ) => {
            const { applicationId, toWorkflowStageId, remarks, assignedTo } = req.body;
            const movedByUserId = (req as any).user.id;

            const updatedWorkflow = await ApplicationWorkflowService.moveApplicationToNextStage(
                movedByUserId,
                applicationId,
                toWorkflowStageId,
                remarks,
                assignedTo
            );

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, "Application moved to next stage successfully", updatedWorkflow)
            );
        }
    );
}