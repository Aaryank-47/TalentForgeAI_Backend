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

    static bulkMoveApplicationsToNextStage = asyncHandler(
        async (
            req: Request,
            res: Response
        ) => {
            const { applicationIds, toWorkflowStageId, remarks, assignedTo } = req.body;
            const movedByUserId = (req as any).user.id;

            const updatedWorkflows = await ApplicationWorkflowService.bulkMoveApplicationsToNextStage(
                movedByUserId,
                applicationIds,
                toWorkflowStageId,
                remarks,
                assignedTo
            );

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, "Applications moved to next stage successfully in bulk", updatedWorkflows)
            );
        }
    );

    static getCandidateWorkflow = asyncHandler(
        async (
            req: Request,
            res: Response
        ) => {
            const { applicationId } = req.params;

            const workflowData = await ApplicationWorkflowService.getCandidateWorkflow(applicationId as string);

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, "Candidate workflow retrieved successfully", workflowData)
            );
        }
    );

    static getWorkflowHistory = asyncHandler(
        async (
            req: Request,
            res: Response
        ) => {
            const { applicationId } = req.params;

            const historyData = await ApplicationWorkflowService.getWorkflowHistory(applicationId as string);

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, "Workflow history retrieved successfully", historyData)
            );
        }
    );
}