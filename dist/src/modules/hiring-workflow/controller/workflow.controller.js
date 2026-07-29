import { asyncHandler } from "../../../common/helper/asyncHandler.js";
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { ApiResponse } from "../../../common/utils/ApiResponse.js";
import { WorkflowServices } from "../services/workflow.service.js";
import { WorkflowStatus } from "@prisma/client";
export class WorkflowController {
    static createWorkflow = asyncHandler(async (req, res) => {
        const { name, description, stages } = req.body;
        const { companyId } = req.params;
        const workflow = await WorkflowServices.createWorkflow(name, description || "", stages, companyId);
        res.status(HTTP_STATUS.CREATED).json(new ApiResponse(true, "Workflow created successfully", workflow));
    });
    static getAllWorkflows = asyncHandler(async (req, res) => {
        const { companyId } = req.params;
        const { status } = req.query;
        const workflows = await WorkflowServices.getAllCompanyWorkflows(companyId, status);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Workflows fetched successfully", workflows));
    });
    static getWorkflowDetails = asyncHandler(async (req, res) => {
        const { companyId, workflowId } = req.params;
        const workflowDetails = await WorkflowServices.getWorkflowDetails(workflowId, companyId);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Workflow details fetched successfully", workflowDetails));
    });
    static updateWorkflow = asyncHandler(async (req, res) => {
        const { companyId, workflowId } = req.params;
        const { name, description, isDefault, stages } = req.body;
        const updatedWorkflow = await WorkflowServices.updateWorkflow(workflowId, name, description, !!isDefault, stages, companyId);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Workflow updated successfully", updatedWorkflow));
    });
    static deleteWorkflow = asyncHandler(async (req, res) => {
        const { companyId, workflowId } = req.params;
        await WorkflowServices.deleteWorkflow(workflowId, companyId);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Workflow deleted successfully", null));
    });
    static setDefaultWorkflow = asyncHandler(async (req, res) => {
        const { companyId, workflowId } = req.params;
        const updatedWorkflow = await WorkflowServices.setDefaultWorkflow(workflowId, companyId);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Default workflow set successfully", updatedWorkflow));
    });
}
//# sourceMappingURL=workflow.controller.js.map