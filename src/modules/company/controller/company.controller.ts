import type { Request, Response } from "express";
import type {
    CreateCompanyDto,
    CompanyIdParamDto,
    UpdateCompanyDto,
    SendInvitationDto,
    GetCompanyInvitationTokenDto,
    AcceptOrRejectInvitationDto,
    UpdateCompanyMemberRoleDto,
    DeleteCompanyDto
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

            const token = await CompanyService.sendInvitation(companyId, inviterId, inviteeEmail, role);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.COMPANY_INVITATION_SENT,
                data: token
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
            const {companyId, userId} = req.params;

            const updatedMember = await CompanyService.updateCompanyMemberRole(companyId, userId, role);
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.COMPANY_MEMBER_ROLE_UPDATED,
                data: updatedMember,
            });
        }
    )
}