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
}
//# sourceMappingURL=application-workflow.controller.js.map