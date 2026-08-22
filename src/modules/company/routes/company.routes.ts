import { Router } from "express";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { CompanyDto } from "../dto/company.dto.js";
import { CompanyController } from "../controller/company.controller.js";
import { loadCompanyMembership } from "../../../common/middleware/loadCompanyMembership.middleware.js";
import { authorizedCompanyMember } from "../../../common/middleware/allowCompanyRoles.middleware.js";
import { uploadSingleFile } from "../../../common/uploads/index.js";
import { ensureActiveCompany } from "../../../common/middleware/ensureActiveCompany .Middleware.js";
import { ensureVerifiedCompany } from "../../../common/middleware/ensureVerifiedCompany.Middleware.js";

const router = Router();

router.post(
    "/register",
    authMiddleware,
    validate(CompanyDto.createCompany, "body"),
    CompanyController.createCompany
);

router.get(
    "/metadata",
    CompanyController.getCompanyMetadata
);

router.get(
    "/my",
    authMiddleware,
    CompanyController.getMyCompanies
)

router.get(
    "/search",
    validate(CompanyDto.searchCompany, "query"),
    CompanyController.searchCompanies
);

router.get(
    "/:companyId",
    authMiddleware,
    authorize("EMPLOYER"),
    validate(CompanyDto.companyIdParam, "params"),
    CompanyController.getCompanyDetails
)

router.patch(
    "/update/:companyId",
    authMiddleware,
    authorize("EMPLOYER"),
    validate(CompanyDto.companyIdParam, "params"),
    ensureActiveCompany,
    validate(CompanyDto.updateCompany, "body"),
    CompanyController.updateCompanyProfile
)

router.delete(
    "/delete/:companyId",
    authMiddleware,
    authorize("EMPLOYER"),
    validate(CompanyDto.companyIdParam, "params"),
    ensureActiveCompany,
    CompanyController.deleteCompanyProfile
)

router.post(
    "/:companyId/invite",
    authMiddleware,
    authorize("EMPLOYER"),
    validate(CompanyDto.companyIdParam, "params"),
    ensureActiveCompany,
    ensureVerifiedCompany,
    validate(CompanyDto.sendInvitation, "body"),
    CompanyController.sendInvitation
)

router.get("/invitation/:token",
    authMiddleware,
    validate(CompanyDto.getCompanyInvitationToken, "params"),
    CompanyController.getInvitation
)

router.post("/invitation/:action/:token",
    authMiddleware,
    validate(CompanyDto.acceptOrRejectInvitation, "params"),
    CompanyController.acceptOrRejectInvitation
)

router.get("/members/:companyId",
    authMiddleware,
    authorize("EMPLOYER"),
    validate(CompanyDto.companyIdParam, "params"),
    ensureActiveCompany,
    CompanyController.listAllCompanyMembers
)

router.patch(
    "/:companyId/members/:userId/role",
    authMiddleware,
    authorize("EMPLOYER"),
    validate(CompanyDto.deleteCompany, "params"),
    ensureActiveCompany,
    loadCompanyMembership,
    authorizedCompanyMember("OWNER", "ADMIN"),
    validate(CompanyDto.updateCompanyMemberRole, "body"),
    CompanyController.updateCompanyMemberRole
);

router.delete(
    "/:companyId/remove/members",
    authMiddleware,
    authorize("EMPLOYER"),
    validate(CompanyDto.companyIdParam, "params"),
    ensureActiveCompany,
    loadCompanyMembership,
    authorizedCompanyMember("OWNER", "ADMIN"),
    validate(CompanyDto.removeCompanyMembers, "body"),
    CompanyController.removeCompanyMember
);

router.patch(
    "/:companyId/logo",
    authMiddleware,
    authorize("EMPLOYER"),
    validate(CompanyDto.companyIdParam, "params"),
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
    validate(CompanyDto.companyIdParam, "params"),
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
    validate(CompanyDto.companyIdParam, "params"),
    CompanyController.verifyCompany
);


router.patch(
    "/admin/companies/:companyId/suspend",
    authMiddleware,
    authorize("SUPER_ADMIN"),
    validate(CompanyDto.companyIdParam, "params"),
    validate(CompanyDto.suspendCompany, "body"),
    CompanyController.suspendCompany
);

router.patch(
    "/admin/companies/:companyId/restore",
    authMiddleware,
    authorize("SUPER_ADMIN"),
    validate(CompanyDto.companyIdParam, "params"),
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
    validate(CompanyDto.companyIdParam, "params"),
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
    validate(CompanyDto.cancelInvitationParam, "params"),
    CompanyController.cancelInvitation
);

// Resend a pending invitation with a fresh token
router.post(
    "/invitations/:invitationId/resend",
    authMiddleware,
    authorize("EMPLOYER"),
    validate(CompanyDto.resendInvitationParam, "params"),
    CompanyController.resendInvitation
);

// Deactivate a company (OWNER only)
router.patch(
    "/:companyId/deactivate",
    authMiddleware,
    authorize("EMPLOYER"),
    validate(CompanyDto.companyIdParam, "params"),
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
    validate(CompanyDto.companyIdParam, "params"),
    loadCompanyMembership,
    authorizedCompanyMember("OWNER"),
    CompanyController.activateCompany
);

export default router;