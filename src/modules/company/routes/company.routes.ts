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
    suspendCompanyDto,
    cancelInvitationParamDto,
    resendInvitationParamDto,
} from "../validators/company.validators.js";
import { CompanyController } from "../controller/company.controller.js";
import { loadCompanyMembership } from "../../../common/middleware/loadCompanyMembership.middleware.js";
import { authorizedCompanyMember } from "../../../common/middleware/allowCompanyRoles.middleware.js";
import { deleteCompanyDto } from "../dto/company.dto.js";
import { uploadSingleFile } from "../../../common/uploads/index.js";
import { ensureActiveCompany } from "../../../common/middleware/ensureActiveCompany .Middleware.js";
import { ensureVerifiedCompany } from "../../../common/middleware/ensureVerifiedCompany.Middleware.js";

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
    ensureActiveCompany,
    validate(updateCompanyDto, "body"),
    CompanyController.updateCompanyProfile
)

router.delete(
    "/delete/:companyId",
    authMiddleware,
    authorize("EMPLOYER"),
    validate(companyIdParamDto, "params"),
    ensureActiveCompany,
    CompanyController.deleteCompanyProfile
)

router.post(
    "/:companyId/invite",
    authMiddleware,
    authorize("EMPLOYER"),
    validate(companyIdParamDto, "params"),
    ensureActiveCompany,
    ensureVerifiedCompany,
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
    ensureActiveCompany,
    CompanyController.listAllCompanyMembers
)

router.patch(
    "/:companyId/members/:userId/role",
    authMiddleware,
    authorize("EMPLOYER"),
    validate(deleteCompanyDto, "params"),
    ensureActiveCompany,
    loadCompanyMembership,
    authorizedCompanyMember("OWNER", "ADMIN"),
    validate(updateCompanyMemberRoleDto, "body"),
    CompanyController.updateCompanyMemberRole
);

router.delete(
    "/:companyId/remove/members",
    authMiddleware,
    authorize("EMPLOYER"),
    validate(companyIdParamDto, "params"),
    ensureActiveCompany,
    loadCompanyMembership,
    authorizedCompanyMember("OWNER", "ADMIN"),
    validate(removeCompanyMembersDto, "body"),
    CompanyController.removeCompanyMember
);

router.patch(
    "/:companyId/logo",
    authMiddleware,
    authorize("EMPLOYER"),
    validate(companyIdParamDto, "params"),
    ensureActiveCompany,
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
    ensureActiveCompany,
    loadCompanyMembership,
    authorizedCompanyMember("OWNER", "ADMIN"),
    uploadSingleFile("cover"),
    CompanyController.uploadCoverImage
);

router.patch(
    "/admin/companies/:companyId/verify",
    authMiddleware,
    authorize("SUPER_ADMIN"),
    validate(companyIdParamDto, "params"),
    CompanyController.verifyCompany
);


router.patch(
    "/admin/companies/:companyId/suspend",
    authMiddleware,
    authorize("SUPER_ADMIN"),
    validate(companyIdParamDto, "params"),
    validate(suspendCompanyDto, "body"),
    CompanyController.suspendCompany
);

router.patch(
    "/admin/companies/:companyId/restore",
    authMiddleware,
    authorize("SUPER_ADMIN"),
    validate(companyIdParamDto, "params"),
    CompanyController.restoreCompany
);

router.get(
    "/get/all",
    CompanyController.getAllCompanies
)

router.get(
    "/sent/invitations/:companyId",
    authMiddleware,
    authorize("EMPLOYER"),
    validate(companyIdParamDto, "params"),
    ensureActiveCompany,
    loadCompanyMembership,
    authorizedCompanyMember("OWNER", "ADMIN"),
    CompanyController.listAllInvitations
)

// Cancel a pending invitation (soft-cancel — keeps history)
router.delete(
    "/invitations/:invitationId/cancel",
    authMiddleware,
    authorize("EMPLOYER"),
    validate(cancelInvitationParamDto, "params"),
    CompanyController.cancelInvitation
);

// Resend a pending invitation with a fresh token
router.post(
    "/invitations/:invitationId/resend",
    authMiddleware,
    authorize("EMPLOYER"),
    validate(resendInvitationParamDto, "params"),
    CompanyController.resendInvitation
);

// Deactivate a company (OWNER only)
router.patch(
    "/:companyId/deactivate",
    authMiddleware,
    authorize("EMPLOYER"),
    validate(companyIdParamDto, "params"),
    ensureActiveCompany,
    loadCompanyMembership,
    authorizedCompanyMember("OWNER"),
    CompanyController.deactivateCompany
);

// Activate a company (OWNER only)
router.patch(
    "/:companyId/activate",
    authMiddleware,
    authorize("EMPLOYER"),
    validate(companyIdParamDto, "params"),
    loadCompanyMembership,
    authorizedCompanyMember("OWNER"),
    CompanyController.activateCompany
);

export default router;