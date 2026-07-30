import { asyncHandler } from "../../../common/helper/asyncHandler.js";
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { ApiResponse } from "../../../common/utils/ApiResponse.js";
import { ApplicationWorkflowService } from "../services/application-workflow.service.js";
export class ApplicationWorkflowController {
    static createApplicationWorkflow = asyncHandler(async (req, res) => {
        const { applicationId, workflowStageId } = req.body;
        const movedByUserId = req.user.id;
        const applicationWorkflow = await ApplicationWorkflowService.createApplicationWorkflow(applicationId, workflowStageId, movedByUserId);
        res.status(HTTP_STATUS.CREATED).json(new ApiResponse(true, "Application workflow created successfully", applicationWorkflow));
    });
    static getHiringBoard = asyncHandler(async (req, res) => {
        const { jobId } = req.params;
        const board = await ApplicationWorkflowService.getHiringBoard(jobId);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Hiring board retrieved successfully", board));
    });
    static moveApplicationToNextStage = asyncHandler(async (req, res) => {
        const { applicationId, toWorkflowStageId, remarks, assignedTo, nextRoundDate } = req.body;
        const movedByUserId = req.user.id;
        const updatedWorkflow = await ApplicationWorkflowService.moveApplicationToNextStage(movedByUserId, applicationId, toWorkflowStageId, remarks, assignedTo, nextRoundDate);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Application moved to next stage successfully", updatedWorkflow));
    });
    static bulkMoveApplicationsToNextStage = asyncHandler(async (req, res) => {
        const { applicationIds, toWorkflowStageId, remarks, assignedTo, nextRoundDate } = req.body;
        const movedByUserId = req.user.id;
        const updatedWorkflows = await ApplicationWorkflowService.bulkMoveApplicationsToNextStage(movedByUserId, applicationIds, toWorkflowStageId, remarks, assignedTo, nextRoundDate);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Applications moved to next stage successfully in bulk", updatedWorkflows));
    });
    static getCandidateWorkflow = asyncHandler(async (req, res) => {
        const { applicationId } = req.params;
        const workflowData = await ApplicationWorkflowService.getCandidateWorkflow(applicationId);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Candidate workflow retrieved successfully", workflowData));
    });
    static getWorkflowHistory = asyncHandler(async (req, res) => {
        const { applicationId } = req.params;
        const historyData = await ApplicationWorkflowService.getWorkflowHistory(applicationId);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Workflow history retrieved successfully", historyData));
    });
}
//# sourceMappingURL=application-workflow.controller.js.map