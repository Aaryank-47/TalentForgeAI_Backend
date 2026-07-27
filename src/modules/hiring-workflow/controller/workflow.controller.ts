import type { Request, Response } from "express";
import { asyncHandler } from "../../../common/helper/asyncHandler.js";
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { ApiResponse } from "../../../common/utils/ApiResponse.js";
import { WorkflowServices } from "../services/workflow.service.js";

export class WorkflowController {
    static createWorkflow = asyncHandler(
        async (
            req: Request, 
            res: Response
        ) => {
            const { name, description, stages } = req.body;
            const { companyId } = req.params;

            const workflow = await WorkflowServices.createWorkflow(
                name,
                description || "",
                stages,
                companyId as string
            );

            res.status(HTTP_STATUS.CREATED).json(
                new ApiResponse(true, "Workflow created successfully", workflow)
            );
        }
    );
}
