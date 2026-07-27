import { Router } from "express";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { WorkflowController } from "../controller/workflow.controller.js";
import { WorkflowDto } from "../dto/hiring-workflow.dto.js";
import { CompanyDto } from "../../company/dto/company.dto.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { loadCompanyMembership } from "../../../common/middleware/loadCompanyMembership.middleware.js";
import { authorizedCompanyMember } from "../../../common/middleware/allowCompanyRoles.middleware.js";

const WorkflowRoutes = Router();

WorkflowRoutes.post(
    "/company/:companyId/workflow",
    authMiddleware,
    authorize("EMPLOYER", "ADMIN"),
    validate(CompanyDto.companyIdParam, "params"),
    validate(WorkflowDto.createWorkflow, "body"),
    loadCompanyMembership,
    authorizedCompanyMember("OWNER", "ADMIN"),
    WorkflowController.createWorkflow
);

WorkflowRoutes.get(
    "/company/:companyId/workflows",
    authMiddleware,
    authorize("EMPLOYER", "ADMIN"),
    validate(CompanyDto.companyIdParam, "params"),
    validate(WorkflowDto.getWorkflowsByStatus, "query"),
    loadCompanyMembership,
    authorizedCompanyMember("OWNER", "ADMIN"),
    WorkflowController.getAllWorkflows
);

WorkflowRoutes.get(
    "/company/:companyId/workflow/:workflowId",
    authMiddleware,
    authorize("EMPLOYER", "ADMIN"),
    validate(CompanyDto.companyIdParam, "params"),
    validate(WorkflowDto.workflowIdParam, "params"),
    loadCompanyMembership,
    authorizedCompanyMember("OWNER", "ADMIN"),
    WorkflowController.getWorkflowDetails
);

WorkflowRoutes.put(
    "/company/:companyId/workflow/:workflowId",
    authMiddleware,
    authorize("EMPLOYER", "ADMIN"),
    validate(CompanyDto.companyIdParam, "params"),
    validate(WorkflowDto.workflowIdParam, "params"),
    validate(WorkflowDto.updateWorkflow, "body"),
    loadCompanyMembership,
    authorizedCompanyMember("OWNER", "ADMIN"),
    WorkflowController.updateWorkflow
);

WorkflowRoutes.delete(
    "/company/:companyId/workflow/:workflowId",
    authMiddleware,
    authorize("EMPLOYER", "ADMIN"),
    validate(CompanyDto.companyIdParam, "params"),
    validate(WorkflowDto.workflowIdParam, "params"),
    loadCompanyMembership,
    authorizedCompanyMember("OWNER", "ADMIN"),
    WorkflowController.deleteWorkflow
);

WorkflowRoutes.patch(
    "/company/:companyId/workflow/:workflowId/default",
    authMiddleware,
    authorize("EMPLOYER", "ADMIN"),
    validate(CompanyDto.companyIdParam, "params"),
    validate(WorkflowDto.workflowIdParam, "params"),
    loadCompanyMembership,
    authorizedCompanyMember("OWNER", "ADMIN"),
    WorkflowController.setDefaultWorkflow
);

export default WorkflowRoutes;
