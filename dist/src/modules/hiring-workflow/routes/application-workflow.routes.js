import { Router } from "express";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { ApplicationWorkflowController } from "../controller/application-workflow.controller.js";
import { WorkflowDto } from "../dto/hiring-workflow.dto.js";
import { CompanyDto } from "../../company/dto/company.dto.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { loadCompanyMembership } from "../../../common/middleware/loadCompanyMembership.middleware.js";
import { authorizedCompanyMember } from "../../../common/middleware/allowCompanyRoles.middleware.js";
const ApplicationWorkflowRoutes = Router();
ApplicationWorkflowRoutes.post("/application-workflow/create", authMiddleware, authorize("CANDIDATE", "EMPLOYER", "ADMIN"), validate(WorkflowDto.createApplicationWorkflow, "body"), ApplicationWorkflowController.createApplicationWorkflow);
ApplicationWorkflowRoutes.get("/application-workflow/hiring-board/:jobId", authMiddleware, authorize("EMPLOYER", "ADMIN"), validate(WorkflowDto.getHiringBoard, "params"), ApplicationWorkflowController.getHiringBoard);
ApplicationWorkflowRoutes.patch("/company/:companyId/application-workflow/move", authMiddleware, authorize("EMPLOYER", "ADMIN"), validate(CompanyDto.companyIdParam, "params"), validate(WorkflowDto.moveApplicationToNextStage, "body"), loadCompanyMembership, authorizedCompanyMember("OWNER", "ADMIN", "RECRUITER", "HIRING_MANAGER"), ApplicationWorkflowController.moveApplicationToNextStage);
ApplicationWorkflowRoutes.patch("/company/:companyId/application-workflow/bulk-move", authMiddleware, authorize("EMPLOYER", "ADMIN"), validate(CompanyDto.companyIdParam, "params"), validate(WorkflowDto.bulkMoveApplicationsToNextStage, "body"), loadCompanyMembership, authorizedCompanyMember("OWNER", "ADMIN", "RECRUITER", "HIRING_MANAGER"), ApplicationWorkflowController.bulkMoveApplicationsToNextStage);
export default ApplicationWorkflowRoutes;
//# sourceMappingURL=application-workflow.routes.js.map