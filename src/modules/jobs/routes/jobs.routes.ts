import Router from "express"
import { JobController } from "../controller/jobs.controller.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { authorizedCompanyMember } from "../../../common/middleware/allowCompanyRoles.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { ensureActiveCompany } from "../../../common/middleware/ensureActiveCompany .Middleware.js"
import { ensureVerifiedCompany } from "../../../common/middleware/ensureVerifiedCompany.Middleware.js";
import { loadCompanyMembership } from "../../../common/middleware/loadCompanyMembership.middleware.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { jobCreationDto, jobDetailsParamDto, jobUpdateDto } from "../validators/jobs.validate.js";
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

router.get(
    "/company/:companyId/job/posts",
    authMiddleware,
    validate(companyIdParamDto, "params"),
    JobController.listCompanyJobs
);

router.get(
    "/company/:companyId/jobs/:jobId",
    authMiddleware,
    validate(jobDetailsParamDto, "params"),
    ensureActiveCompany,
    ensureVerifiedCompany,
    loadCompanyMembership,
    authorizedCompanyMember("OWNER", "ADMIN", "RECRUITER", "HIRING_MANAGER"),
    JobController.getJobDetails
);

router.patch(
    "/company/:companyId/job/:jobId/update",
    authMiddleware,
    authorize("EMPLOYER","ADMIN"),
    validate(jobDetailsParamDto, "params"),
    validate(jobUpdateDto, "body"),
    ensureActiveCompany,
    ensureVerifiedCompany,
    loadCompanyMembership,
    authorizedCompanyMember("OWNER", "ADMIN", "RECRUITER", "HIRING_MANAGER"),
    JobController.updateJobDetails
)

export default router;