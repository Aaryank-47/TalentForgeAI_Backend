import Router from "express"
import { JobController } from "../controller/jobs.controller.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { authorizedCompanyMember } from "../../../common/middleware/allowCompanyRoles.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { ensureActiveCompany } from "../../../common/middleware/ensureActiveCompany .Middleware.js"
import { ensureVerifiedCompany } from "../../../common/middleware/ensureVerifiedCompany.Middleware.js";
import { loadCompanyMembership } from "../../../common/middleware/loadCompanyMembership.middleware.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { jobCreationDto } from "../validators/jobs.validate.js";
import { companyIdParamDto } from "../../company/validators/company.validators.js"

const router = Router();

router.post(
    "/company/:companyId/job",
    authMiddleware,
    authorize("EMPLOYER","ADMIN"),
    validate(companyIdParamDto, "params"),
    validate(jobCreationDto, "body"),
    ensureActiveCompany,
    ensureVerifiedCompany,
    loadCompanyMembership,
    authorizedCompanyMember("HIRING_MANAGER","RECRUITER","OWNER"),
    JobController.createJob
);

export default router;