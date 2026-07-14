import { Router } from "express";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { 
    createCompanyDto, 
    companyIdParamDto, 
    updateCompanyDto, 
    sendInvitationDto,
    getCompanyInvitationTokenDto,
    acceptOrRejectInvitationDto
} from "../validators/company.validators.js";
import { CompanyController } from "../controller/company.controller.js";

const router = Router();

router.post(
    "/register",
    authMiddleware,
    authorize("EMPLOYER"),
    validate(createCompanyDto, "body"),
    CompanyController.createCompany
);

router.get(
    "/my",
    authMiddleware,
    authorize("EMPLOYER"),
    CompanyController.getMyCompanies
)

router.get(
    "/:companyId",
    authMiddleware,
    authorize("EMPLOYER"),
    validate(companyIdParamDto, "params"),
    CompanyController.getCompanyDetails
)

router.patch(
    "/update/:companyId",
    authMiddleware,
    authorize("EMPLOYER"),
    validate(companyIdParamDto, "params"),
    validate(updateCompanyDto, "body"),
    CompanyController.updateCompanyProfile
)

router.delete(
    "/delete/:companyId",
    authMiddleware,
    authorize("EMPLOYER"),
    validate(companyIdParamDto, "params"),
    CompanyController.deleteCompanyProfile
)

router.post(
    "/:companyId/invite",
    authMiddleware,
    authorize("EMPLOYER"),
    validate(companyIdParamDto, "params"),
    validate(sendInvitationDto, "body"),
    CompanyController.sendInvitation
)

router.get("/invitation/:token",
    authMiddleware,
    validate(getCompanyInvitationTokenDto,"params"),
    CompanyController.getInvitation
)

router.post("/invitation/:action/:token",
    authMiddleware,
    validate(acceptOrRejectInvitationDto,"params"),
    CompanyController.acceptOrRejectInvitation
)

export default router;