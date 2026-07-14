import type { CreateCompanyDto, UpdateCompanyDto } from "../dto/company.dto.js";
import type { CompanyView } from "../repository/company.repository.js";
import { AuthRepository } from "../../auth/repositories/auth.repository.js";
import { CompanyRepository } from "../repository/company.repository.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ForbiddenError } from "../../../common/errors/ForbiddenError.js";
import { slugifyText } from "../../auth/utils/auth.utils.js";
import { calculateProfileCompletion, omitUndefined } from "../utils/company.utils.js";
import { CompanyMemberRole, UserRole, CompanyMemberStatus } from "@prisma/client";
import { emailTemplates } from "../../../common/email/email.templates.js"
import { EmailService } from "../../../common/email/email.service.js";
import { InvitationTokenHelper } from "../utils/invitationToken.util.js";
import { env } from "../../../config/env.js";
import type { InvitationResponse } from "../interfaces/company.interface.js"

export class CompanyService {
    static async createCompany(
        dto: CreateCompanyDto,
        userId: string
    ): Promise<CompanyView> {
        const user = await AuthRepository.findUserById(userId);
        if (!user) {
            throw new NotFoundError("Authenticated user not found.");
        }

        const slug = slugifyText(dto.companyName);

        const existing = await CompanyRepository.findCompanyBySlug(slug);
        if (existing) {
            throw new ConflictError(
                "A company with this name already exists. Please choose a different name."
            );
        }

        const newCompany = await CompanyRepository.createCompany({
            userId,
            companyName: dto.companyName,
            slug,
            companyEmail: dto.companyEmail,
            website: dto.website,
            phoneNumber: dto.phoneNumber,
        });

        return newCompany;
    }

    static async getMyCompanies(
        userId: string
    ): Promise<CompanyView[]> {
        const user = await AuthRepository.findUserById(userId);
        if (!user) {
            throw new NotFoundError("Authenticated user not found.");
        }

        const companies = await CompanyRepository.getMyCompanies(userId);
        return companies;
    }

    static async getCompanyDetails(
        companyId: string
    ): Promise<CompanyView> {
        const company = await CompanyRepository.findCompanyById(companyId);
        if (!company) {
            throw new NotFoundError("Company not found.");
        }
        return company;
    }

    static async updateCompanyProfile(
        companyId: string,
        userId: string,
        dto: UpdateCompanyDto
    ): Promise<CompanyView> {
        const company = await CompanyRepository.getRawCompanyById(companyId);
        if (!company) {
            throw new NotFoundError("Company not found.");
        }

        const member = await CompanyRepository.findMemberByUserAndCompany(userId, companyId);
        if (
            !member ||
            (member.role !== CompanyMemberRole.OWNER && member.role !== CompanyMemberRole.ADMIN)
        ) {
            throw new ForbiddenError("You do not have permission to update this company.");
        }

        const merged = { ...company, ...dto };
        const profileCompletion = calculateProfileCompletion(merged as any);

        const updated = await CompanyRepository.updateCompanyProfile(
            companyId,
            omitUndefined({
                ...dto,
                profileCompletion,
            })
        );

        return updated;
    }

    static async deleteCompany(
        companyId: string,
        userId: string
    ): Promise<void> {
        const user = await AuthRepository.findUserById(userId);
        if (!user) {
            throw new NotFoundError("Authenticated user not found.");
        }
        if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.EMPLOYER) {
            throw new ForbiddenError("You do not have permission to delete this company.");
        }

        const company = await CompanyRepository.getRawCompanyById(companyId);
        if (!company) {
            throw new NotFoundError("Company not found.");
        }

        if (company.deletedAt) {
            throw new ConflictError("Company is already deleted.");
        }

        // Admins and Super Admins can bypass the membership check
        if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
            const membership = await CompanyRepository.membership(companyId, userId);

            if (!membership || (membership.role !== CompanyMemberRole.OWNER && membership.role !== CompanyMemberRole.ADMIN)) {
                throw new ForbiddenError("You do not have permission to delete this company.");
            }
        }

        await CompanyRepository.deleteCompany(companyId, userId);
    }

    static async sendInvitation(
        companyId: string,
        inviterId: string,
        inviteeEmail: string,
        role: CompanyMemberRole
    ): Promise<string> {

        const company = await CompanyRepository.getRawCompanyById(companyId);
        if (!company) {
            throw new NotFoundError("Company not found.");
        }

        if (company.deletedAt) {
            throw new ConflictError("Company has been deleted.");
        }


        const inviter = await AuthRepository.findProfileByUserId(inviterId);
        if (!inviter || !inviter.profile) {
            throw new NotFoundError("Inviter profile not found.");
        }

        const inviterMembership = await CompanyRepository.membership(
            companyId,
            inviterId
        );

        if (!inviterMembership || (inviterMembership.role !== CompanyMemberRole.OWNER && inviterMembership.role !== CompanyMemberRole.ADMIN)) {
            throw new ForbiddenError("You do not have permission to send invitations for this company.");
        }

        const invitee = await AuthRepository.findUserByEmail(inviteeEmail);

        const token = InvitationTokenHelper.generateToken({
            companyId,
            inviteeEmail,
            invitedBy: inviterId,
            role,
        });

        if (invitee) {
            if (invitee.id === inviterId) {
                throw new ConflictError(
                    "You cannot invite yourself to the company."
                );
            }

            const existingMembership = await CompanyRepository.membership(
                companyId,
                invitee.id
            );

            if (existingMembership) {
                if (existingMembership.status === CompanyMemberStatus.INVITED) {
                    throw new ConflictError(
                        "An invitation has already been sent to this user."
                    );
                }
                throw new ConflictError(
                    "The user is already a member of this company."
                );
            }

            await CompanyRepository.createInvitedMember({
                userId: invitee.id,
                companyId,
                role,
                invitedBy: inviterId,
            });

            const invitationLink = `${env.app.frontendUrl}/invitations/accept?token=${token}`;
            // console.log("invitationLink : ",invitationLink);
            const emailTemplate = emailTemplates.existingUserInvitationTemplate(
                company.companyName,
                inviter.profile.fullName,
                role,
                invitationLink
            );

            await EmailService.sendEmail({
                to: inviteeEmail,
                ...emailTemplate,
            });
        } else {
            const registerLink = `${process.env.FRONTEND_URL}/register?invite=${token}`;
            const emailTemplate = emailTemplates.newUserInvitationTemplate(
                company.companyName,
                inviter.profile.fullName,
                role,
                registerLink
            );

            await EmailService.sendEmail({
                to: inviteeEmail,
                ...emailTemplate,
            });
        }

        return token;
    }

    static async getInvitation(
        token: string
    ): Promise<InvitationResponse> {

        const payload = InvitationTokenHelper.verifyToken(token);
        const company = await CompanyRepository.findCompanyById(payload.companyId);

        if (!company) {
            throw new NotFoundError("Company not found.");
        }
        if (company.deletedAt) {
            throw new ConflictError(
                "This company is no longer accepting invitations."
            );
        }

        const invitee = await AuthRepository.findUserByEmail(
            payload.inviteeEmail
        );
        if (invitee) {

            const membership = await CompanyRepository.membership(
                payload.companyId,
                invitee.id
            );

            if (membership) {

                switch (membership.status) {

                    case CompanyMemberStatus.ACTIVE:
                        throw new ConflictError(
                            "You are already a member of this company."
                        );

                    case CompanyMemberStatus.SUSPENDED:
                        throw new ConflictError(
                            "Your company membership is suspended."
                        );

                    case CompanyMemberStatus.INVITED:
                        break;

                    case CompanyMemberStatus.LEFT:
                        break;

                    case CompanyMemberStatus.REMOVED:
                        break;
                }
            }
        }

        return {
            companyId: company.id,
            companyName: company.companyName,
            companyLogo: company.logo,
            companyEmail: company.companyEmail,
            role: payload.role,
            inviteeEmail: payload.inviteeEmail,
            expiresAt: payload.expiration
                ? new Date(payload.expiration * 1000)
                : null
        };
    }
}

