import { Router } from "express";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { StageLibController } from "../controller/stage-library.controller.js";
import { WorkflowDto } from "../dto/hiring-workflow.dto.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { loadCompanyMembership } from "../../../common/middleware/loadCompanyMembership.middleware.js";
import { authorizedCompanyMember } from "../../../common/middleware/allowCompanyRoles.middleware.js";
import { companyIdParamDto } from "../../company/validators/company.validators.js";

const StageLibRoutes = Router();

StageLibRoutes.post(
    "/company/:companyId/custom-stage",
    authMiddleware,
    authorize("EMPLOYER", "ADMIN"),
    validate(companyIdParamDto, "params"),
    validate(WorkflowDto.createCustomStage, "body"),
    loadCompanyMembership,
    authorizedCompanyMember("OWNER"),
    StageLibController.createCustomStage
);

export default StageLibRoutes;
