import { Router } from "express";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { StageLibController } from "../controller/stage-library.controller.js";
import { WorkflowDto } from "../dto/hiring-workflow.dto.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { loadCompanyMembership } from "../../../common/middleware/loadCompanyMembership.middleware.js";
import { authorizedCompanyMember } from "../../../common/middleware/allowCompanyRoles.middleware.js";
import { CompanyDto } from "../../company/dto/company.dto.js";
const StageLibRoutes = Router();
StageLibRoutes.post("/system-stage", authMiddleware, authorize("ADMIN", "SUPER_ADMIN"), validate(WorkflowDto.createCustomStage, "body"), StageLibController.createSystemStages);
StageLibRoutes.post("/company/:companyId/custom-stage", authMiddleware, authorize("EMPLOYER", "ADMIN"), validate(CompanyDto.companyIdParam, "params"), validate(WorkflowDto.createCustomStage, "body"), loadCompanyMembership, authorizedCompanyMember("OWNER"), StageLibController.createCustomStage);
StageLibRoutes.get("/company/:companyId/stages", authMiddleware, authorize("EMPLOYER", "ADMIN"), validate(CompanyDto.companyIdParam, "params"), loadCompanyMembership, authorizedCompanyMember("OWNER"), StageLibController.getAllsystemAndCustomStages);
StageLibRoutes.patch("/company/:companyId/stage/:stageId", authMiddleware, authorize("EMPLOYER", "ADMIN"), validate(CompanyDto.companyIdParam, "params"), validate(WorkflowDto.stageIdParam, "params"), validate(WorkflowDto.updateStageLibrary, "body"), loadCompanyMembership, authorizedCompanyMember("OWNER"), StageLibController.updateCustomStage);
StageLibRoutes.delete("/company/:companyId/stage/:stageId", authMiddleware, authorize("EMPLOYER", "ADMIN"), validate(CompanyDto.companyIdParam, "params"), validate(WorkflowDto.stageIdParam, "params"), loadCompanyMembership, authorizedCompanyMember("OWNER"), StageLibController.deleteCustomStage);
StageLibRoutes.delete("/system-stage/:stageId", authMiddleware, authorize("ADMIN", "SUPER_ADMIN"), validate(WorkflowDto.stageIdParam, "params"), StageLibController.deleteSystemStage);
export default StageLibRoutes;
//# sourceMappingURL=stage-library.routes.js.map