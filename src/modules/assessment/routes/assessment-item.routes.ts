import { Router } from "express";
// import { AssessmentItemController } from "../controllers/assessment-item.controller.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { authorizedCompanyMember } from "../../../common/middleware/allowCompanyRoles.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { ensureActiveCompany } from "../../../common/middleware/ensureActiveCompany .Middleware.js";
import { ensureVerifiedCompany } from "../../../common/middleware/ensureVerifiedCompany.Middleware.js";
import { loadCompanyMembership } from "../../../common/middleware/loadCompanyMembership.middleware.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
// import { AssessmentItemDto } from "../dto/assessment-item.dto.js";
import { CompanyDto } from "../../company/dto/company.dto.js";

const router = Router();



export default router;
