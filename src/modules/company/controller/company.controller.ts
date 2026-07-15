import type { Request, Response } from "express";
import type {
    CreateCompanyDto,
    CompanyIdParamDto,
    UpdateCompanyDto,
    SendInvitationDto,
    GetCompanyInvitationTokenDto,
    AcceptOrRejectInvitationDto,
    UpdateCompanyMemberRoleDto,
    DeleteCompanyDto,
    RemoveCompanyMembersDto,
    SearchCompanyDto,
    SuspendCompanyDto,
    CancelInvitationParamDto,
    ResendInvitationParamDto,
} from "../dto/company.dto.js";
import { CompanyService } from "../services/company.service.js";
import { asyncHandler } from "../../../common/helper/asyncHandler.js";
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { MESSAGE } from "../../../common/constants/messages.js";

export class CompanyController {
    static createCompany = asyncHandler(
        async (req: Request, res: Response) => {
            const dto = req.body as CreateCompanyDto;
            const userId = req.user.id;

            const company = await CompanyService.createCompany(dto, userId);

            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: MESSAGE.COMPANY_CREATED,
                data: company,
            });
        }
    );

    static getMyCompanies = asyncHandler(
        async (req: Request, res: Response) => {
            const userId = req.user.id;

            const companies = await CompanyService.getMyCompanies(userId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.COMPANIES_FETCHED,
                data: companies,
            });
        }
    )

    static getCompanyDetails = asyncHandler(
        async (
            req: Request<CompanyIdParamDto>,
            res: Response
        ) => {
            const companyId = req.params.companyId;

            const company = await CompanyService.getCompanyDetails(companyId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.COMPANY_DETAILS_FETCHED,
                data: company,
            });
        }
    )

    static updateCompanyProfile = asyncHandler(
        async (
            req: Request<CompanyIdParamDto>,
            res: Response
        ) => {
            const companyId = req.params.companyId;
            const userId = req.user.id;
            const dto = req.body as UpdateCompanyDto;

            const company = await CompanyService.updateCompanyProfile(companyId, userId, dto);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.COMPANY_UPDATED,
                data: company,
            });
        }
    )

    static deleteCompanyProfile = asyncHandler(
        async (
            req: Request<CompanyIdParamDto>,
            res: Response
        ) => {
            const companyId = req.params.companyId;
            const userId = req.user.id;

            await CompanyService.deleteCompany(companyId, userId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.COMPANY_DELETED,
            });
        }
    )

    static sendInvitation = asyncHandler(
        async (
            req: Request<SendInvitationDto & CompanyIdParamDto>,
            res: Response
        ) => {
            const { companyId } = req.params;
            const { inviterId, inviteeEmail, role } = req.body;

            const result = await CompanyService.sendInvitation(companyId, inviterId, inviteeEmail, role);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.COMPANY_INVITATION_SENT,
                data: result
            });
        }
    )

    static getInvitation = asyncHandler(
        async (req: Request<GetCompanyInvitationTokenDto>, res: Response) => {

            const { token } = req.params;

            const invitation =
                await CompanyService.getInvitation(token);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.COMPANY_INVITATION_FETCHED,
                data: invitation
            });
        }
    );

    static acceptOrRejectInvitation = asyncHandler(
        async (req: Request<AcceptOrRejectInvitationDto>, res: Response) => {

            const { action, token } = req.params;
            const userId = req.user.id;
            const invitation = await CompanyService.acceptOrRejectInvitation(token, userId, action);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.COMPANY_INVITATION_ACCEPTED,
                data: invitation
            });
        }
    )

    static listAllCompanyMembers = asyncHandler(
        async (req: Request<CompanyIdParamDto>, res: Response) => {
            const companyId = req.params.companyId;

            const members = await CompanyService.listAllCompanyMembers(companyId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.COMPANY_MEMBERS_FETCHED,
                data: members,
            });
        }
    )

    static updateCompanyMemberRole = asyncHandler(
        async (req: Request<UpdateCompanyMemberRoleDto & DeleteCompanyDto>, res: Response) => {
            const { role } = req.body;
            const { companyId, userId } = req.params;

            const updatedMember = await CompanyService.updateCompanyMemberRole(companyId, userId, role);
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.COMPANY_MEMBER_ROLE_UPDATED,
                data: updatedMember,
            });
        }
    )

    static removeCompanyMember = asyncHandler(
        async (req: Request<RemoveCompanyMembersDto & DeleteCompanyDto>, res: Response) => {
            const { companyId } = req.params;
            const { userIds } = req.body;

            const updatedMember = await CompanyService.removeCompanyMember(companyId, userIds);
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.COMPANY_MEMBER_REMOVED,
                data: updatedMember,
            });
        }
    )

    static uploadLogo = asyncHandler(
        async (req: Request<CompanyIdParamDto>, res: Response) => {
            const companyId = req.params.companyId;
            const file = req.file as Express.Multer.File;

            const result = await CompanyService.uploadLogo(companyId, file);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.COMPANY_LOGO_UPLOADED,
                data: result,
            });
        }
    )

    static uploadCoverImage = asyncHandler(
        async (req: Request<CompanyIdParamDto>, res: Response) => {
            const companyId = req.params.companyId;
            const file = req.file as Express.Multer.File;

            const result = await CompanyService.uploadCoverImage(companyId, file);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.COMPANY_COVER_UPLOADED,
                data: result,
            });
        }
    )

    static searchCompanies = asyncHandler(
        async (req: Request, res: Response) => {
            console.log("------------------ Reached to the controller ----------------------")
            const params = req.query as unknown as SearchCompanyDto;
            console.log("params : " + params)
            const result = await CompanyService.searchCompanies(params);
            console.log("result : " + result)

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.COMPANY_SEARCH_SUCCESS,
                data: result.data,
                pagination: result.pagination,
            });
        }
    )

    static verifyCompany = asyncHandler(
        async (
            req: Request<CompanyIdParamDto>,
            res: Response
        ) => {
            const { companyId } = req.params;

            const company = await CompanyService.verifyCompany(
                companyId,
                req.user!.id
            );

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.COMPANY_VERIFIED,
                data: company
            });
        }
    );
    
    static suspendCompany = asyncHandler(
        async (
            req: Request<CompanyIdParamDto, any, SuspendCompanyDto>,
            res: Response
        ) => {
            const { companyId } = req.params;
            const { reason } = req.body;

            const company = await CompanyService.suspendCompany(
                companyId,
                req.user!.id,
                reason
            );

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.COMPANY_SUSPENDED,
                data: company
            });
        }
    );

    static restoreCompany = asyncHandler(
        async (
            req: Request<CompanyIdParamDto>,
            res: Response
        ) => {
            const { companyId } = req.params;

            const company = await CompanyService.restoreCompany(
                companyId,
                req.user!.id
            );

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.COMPANY_RESTORED,
                data: company
            });
        }
    );

    static getAllCompanies = asyncHandler(
        async(
            req: Request,
            res: Response
        ) => {
            const companies = await CompanyService.getAllCompanies();
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.COMPANIES_FETCHED,
                data: companies
            });
        }
    )

    static listAllInvitations = asyncHandler(
        async(
            req: Request<CompanyIdParamDto>,
            res: Response
        )=>{
            const {companyId} = req.params;
            console.log("companyId : ", companyId)
            
            const invitations = await CompanyService.getAllSentInvitation(companyId);
            console.log("invitations : ", invitations)
            
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.COMPANY_INVITATION_FETCHED,
                data: invitations
            });
        }
    )

    static cancelInvitation = asyncHandler(
        async (
            req: Request<CancelInvitationParamDto>,
            res: Response
        ) => {
            const { invitationId } = req.params;
            const userId = req.user.id;

            const result = await CompanyService.cancelInvitation(invitationId, userId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.COMPANY_INVITATION_CANCELLED,
                data: result,
            });
        }
    );

    static resendInvitation = asyncHandler(
        async (
            req: Request<ResendInvitationParamDto>,
            res: Response
        ) => {
            const { invitationId } = req.params;
            const userId = req.user.id;

            const result = await CompanyService.resendInvitation(invitationId, userId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.COMPANY_INVITATION_RESENT,
                data: result,
            });
        }
    );

    static deactivateCompany = asyncHandler(
        async (
            req: Request<CompanyIdParamDto>,
            res: Response
        ) => {
            const { companyId } = req.params;
            const userId = req.user.id;

            const company = await CompanyService.deactivateCompany(companyId, userId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.COMPANY_DEACTIVATED,
                data: company,
            });
        }
    );

    static activateCompany = asyncHandler(
        async (
            req: Request<CompanyIdParamDto>,
            res: Response
        ) => {
            const { companyId } = req.params;
            const userId = req.user.id;

            const company = await CompanyService.activateCompany(companyId, userId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.COMPANY_ACTIVATED,
                data: company,
            });
        }
    );
}