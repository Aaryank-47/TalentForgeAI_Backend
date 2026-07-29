import { Router } from "express";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { ApplicationWorkflowController } from "../controller/application-workflow.controller.js";
import { WorkflowDto } from "../dto/hiring-workflow.dto.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";

const ApplicationWorkflowRoutes = Router();

ApplicationWorkflowRoutes.post(
    "/application-workflow/create",
    authMiddleware,
    authorize("CANDIDATE", "EMPLOYER", "ADMIN"),
    validate(WorkflowDto.createApplicationWorkflow, "body"),
    ApplicationWorkflowController.createApplicationWorkflow
);

ApplicationWorkflowRoutes.get(
    "/application-workflow/hiring-board/:jobId",
    authMiddleware,
    authorize("EMPLOYER", "ADMIN"),
    validate(WorkflowDto.getHiringBoard, "params"),
    ApplicationWorkflowController.getHiringBoard
);

export default ApplicationWorkflowRoutes;
