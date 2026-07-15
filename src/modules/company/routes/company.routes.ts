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
    acceptOrRejectInvitationDto,
    updateCompanyMemberRoleDto,
    removeCompanyMembersDto,
    searchCompanyDto,
} from "../validators/company.validators.js";
import { CompanyController } from "../controller/company.controller.js";
import { loadCompanyMembership } from "../../../common/middleware/loadCompanyMembership.middleware.js";
import { authorizedCompanyMember } from "../../../common/middleware/allowCompanyRoles.middleware.js";
import { deleteCompanyDto } from "../dto/company.dto.js";
import { uploadSingleFile } from "../../../common/uploads/index.js";

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
    "/search",
    validate(searchCompanyDto, "query"),
    CompanyController.searchCompanies
);

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
    validate(getCompanyInvitationTokenDto, "params"),
    CompanyController.getInvitation
)

router.post("/invitation/:action/:token",
    authMiddleware,
    validate(acceptOrRejectInvitationDto, "params"),
    CompanyController.acceptOrRejectInvitation
)

router.get("/members/:companyId",
    authMiddleware,
    authorize("EMPLOYER"),
    validate(companyIdParamDto, "params"),
    CompanyController.listAllCompanyMembers
)

router.patch(
    "/:companyId/members/:userId/role",
    authMiddleware,
    authorize("EMPLOYER"),
    loadCompanyMembership,
    authorizedCompanyMember("OWNER", "ADMIN"),
    validate(deleteCompanyDto, "params"),
    validate(updateCompanyMemberRoleDto, "body"),
    CompanyController.updateCompanyMemberRole
);

router.delete(
    "/:companyId/remove/members",
    authMiddleware,
    authorize("EMPLOYER"),
    loadCompanyMembership,
    authorizedCompanyMember("OWNER", "ADMIN"),
    validate(companyIdParamDto, "params"),
    validate(removeCompanyMembersDto, "body"),
    CompanyController.removeCompanyMember
);

router.patch(
    "/:companyId/logo",
    authMiddleware,
    authorize("EMPLOYER"),
    validate(companyIdParamDto, "params"),
    loadCompanyMembership,
    authorizedCompanyMember("OWNER", "ADMIN"),
    uploadSingleFile("logo"),
    CompanyController.uploadLogo
);

router.patch(
    "/:companyId/cover",
    authMiddleware,
    authorize("EMPLOYER"),
    validate(companyIdParamDto, "params"),
    loadCompanyMembership,
    authorizedCompanyMember("OWNER", "ADMIN"),
    uploadSingleFile("cover"),
    CompanyController.uploadCoverImage
);

export default router;