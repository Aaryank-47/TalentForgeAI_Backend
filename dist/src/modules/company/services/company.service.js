import { AuthRepository } from "../../auth/repositories/auth.repository.js";
import { CompanyRepository } from "../repository/company.repository.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ForbiddenError } from "../../../common/errors/ForbiddenError.js";
import { ValidationError } from "../../../common/errors/ValidationError.js";
import { slugifyText } from "../../auth/utils/auth.utils.js";
import { calculateProfileCompletion, omitUndefined } from "../utils/company.utils.js";
import { CompanyMemberRole, UserRole, CompanyMemberStatus, CompanyStatus } from "@prisma/client";
import { emailTemplates } from "../../../common/email/email.templates.js";
import { EmailService } from "../../../common/email/email.service.js";
import { InvitationTokenHelper } from "../utils/invitationToken.util.js";
import { env } from "../../../config/env.js";
import { UnauthorizedError } from "../../../common/errors/UnauthorizedError.js";
import { ElasticsearchService } from "./elasticsearch.service.js";
import { uploadFileToCloudinary } from "../../../common/helper/upload.helper.js";
import { deleteFileFromCloudinary } from "../../../common/helper/delete.helper.js";
import { logger } from "../../../common/logger/logger.js";
import { COMPANY_IMAGE_MIME_TYPES, COMPANY_IMAGE_MAX_BYTES } from "../constants/company.contants.js";
import { extractPublicId, toCompanySearchView } from "../utils/company.utils.js";
export class CompanyService {
    static async createCompany(dto, userId) {
        const user = await AuthRepository.findUserById(userId);
        if (!user) {
            throw new NotFoundError("Authenticated user not found.");
        }
        const slug = slugifyText(dto.companyName);
        const existing = await CompanyRepository.findCompanyBySlug(slug);
        if (existing) {
            throw new ConflictError("A company with this name already exists. Please choose a different name.");
        }
        const newCompany = await CompanyRepository.createCompany({
            userId,
            companyName: dto.companyName,
            slug,
            companyEmail: dto.companyEmail,
            website: dto.website,
            phoneNumber: dto.phoneNumber,
        });
        ElasticsearchService.indexCompany(toCompanySearchView(newCompany)).catch((err) => {
            logger.error({ err, companyId: newCompany.id }, "[ES] Failed to index new company.");
        });
        return newCompany;
    }
    static async getMyCompanies(userId) {
        const user = await AuthRepository.findUserById(userId);
        if (!user) {
            throw new NotFoundError("Authenticated user not found.");
        }
        const companies = await CompanyRepository.getMyCompanies(userId);
        return companies;
    }
    static async getCompanyDetails(companyId) {
        const company = await CompanyRepository.findCompanyById(companyId);
        if (!company) {
            throw new NotFoundError("Company not found.");
        }
        return company;
    }
    static async updateCompanyProfile(companyId, userId, dto) {
        const company = await CompanyRepository.getRawCompanyById(companyId);
        if (!company) {
            throw new NotFoundError("Company not found.");
        }
        const member = await CompanyRepository.findMemberByUserAndCompany(userId, companyId);
        if (!member ||
            (member.role !== CompanyMemberRole.OWNER && member.role !== CompanyMemberRole.ADMIN)) {
            throw new ForbiddenError("You do not have permission to update this company.");
        }
        const merged = { ...company, ...dto };
        const profileCompletion = calculateProfileCompletion(merged);
        const updated = await CompanyRepository.updateCompanyProfile(companyId, omitUndefined({
            ...dto,
            profileCompletion,
        }));
        ElasticsearchService.indexCompany(toCompanySearchView(updated)).catch((err) => {
            logger.error({ err, companyId }, "[ES] Failed to sync updated company.");
        });
        return updated;
    }
    static async deleteCompany(companyId, userId) {
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
        if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
            const membership = await CompanyRepository.membership(companyId, userId);
            if (!membership || (membership.role !== CompanyMemberRole.OWNER && membership.role !== CompanyMemberRole.ADMIN)) {
                throw new ForbiddenError("You do not have permission to delete this company.");
            }
        }
        await CompanyRepository.deleteCompany(companyId, userId);
        ElasticsearchService.removeCompany(companyId).catch((err) => {
            logger.error({ err, companyId }, "[ES] Failed to remove deleted company from index.");
        });
    }
    static async sendInvitation(companyId, inviterId, inviteeEmail, role) {
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
        const inviterMembership = await CompanyRepository.membership(companyId, inviterId);
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
        let invitationId = null;
        if (invitee) {
            if (invitee.id === inviterId) {
                throw new ConflictError("You cannot invite yourself to the company.");
            }
            const existingMembership = await CompanyRepository.membership(companyId, invitee.id);
            if (existingMembership) {
                if (existingMembership.status === CompanyMemberStatus.INVITED) {
                    throw new ConflictError("An invitation has already been sent to this user.");
                }
                throw new ConflictError("The user is already a member of this company.");
            }
            const createdMember = await CompanyRepository.createInvitedMember({
                userId: invitee.id,
                companyId,
                role,
                invitedBy: inviterId,
            });
            invitationId = createdMember.id;
            const invitationLink = `${env.app.frontendUrl}/invitations/accept?token=${token}`;
            const emailTemplate = emailTemplates.existingUserInvitationTemplate(company.companyName, inviter.profile.fullName, role, invitationLink);
            await EmailService.sendEmail({
                to: inviteeEmail,
                ...emailTemplate,
            });
        }
        else {
            const registerLink = `${process.env.FRONTEND_URL}/register?invite=${token}`;
            const emailTemplate = emailTemplates.newUserInvitationTemplate(company.companyName, inviter.profile.fullName, role, registerLink);
            await EmailService.sendEmail({
                to: inviteeEmail,
                ...emailTemplate,
            });
        }
        return { token, invitationId };
    }
    static async getInvitation(token) {
        const payload = InvitationTokenHelper.verifyToken(token);
        const company = await CompanyRepository.findCompanyById(payload.companyId);
        if (!company) {
            throw new NotFoundError("Company not found.");
        }
        if (company.deletedAt) {
            throw new ConflictError("This company is no longer accepting invitations.");
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
    static async acceptOrRejectInvitation(token, userId, action) {
        const payload = InvitationTokenHelper.verifyToken(token);
        const company = await CompanyRepository.findCompanyById(payload.companyId);
        if (!company) {
            throw new NotFoundError("Company not found.");
        }
        if (company.deletedAt) {
            throw new ConflictError("This company is no longer accepting invitations.");
        }
        const invitee = await AuthRepository.findUserById(userId);
        if (!invitee) {
            throw new UnauthorizedError("Authenticated user not found.");
        }
        if (invitee.email !== payload.inviteeEmail) {
            throw new ForbiddenError("This invitation does not belong to your account.");
        }
        const membership = await CompanyRepository.membership(payload.companyId, userId);
        if (!membership) {
            throw new NotFoundError("Invitation record not found.");
        }
        switch (membership.status) {
            case CompanyMemberStatus.ACTIVE:
                throw new ConflictError("You are already a member of this company.");
            case CompanyMemberStatus.SUSPENDED:
                throw new ConflictError("Your membership has been suspended.");
            case CompanyMemberStatus.LEFT:
                throw new ConflictError("This invitation is no longer valid.");
            case CompanyMemberStatus.REMOVED:
                throw new ConflictError("This invitation has already been rejected.");
            case CompanyMemberStatus.INVITED:
                break;
        }
        if (action === "accept") {
            await CompanyRepository.updateMembership(membership.id, {
                status: CompanyMemberStatus.ACTIVE,
                joinedAt: new Date(),
            });
            return;
        }
        await CompanyRepository.updateMembership(membership.id, {
            status: CompanyMemberStatus.REMOVED,
        });
    }
    static async getAllSentInvitation(companyId) {
        const company = await CompanyRepository.getRawCompanyById(companyId);
        if (!company) {
            throw new NotFoundError("Company not found.");
        }
        if (company.deletedAt) {
            throw new ConflictError("Company has been deleted.");
        }
        return CompanyRepository.listAllInvitations(companyId);
    }
    static async listAllCompanyMembers(companyId) {
        const company = await CompanyRepository.getRawCompanyById(companyId);
        if (!company) {
            throw new NotFoundError("Company not found.");
        }
        if (company.deletedAt) {
            throw new ConflictError("Company has been deleted.");
        }
        const members = await CompanyRepository.listAllMembers(companyId);
        return members;
    }
    static async updateCompanyMemberRole(companyId, userId, role) {
        const company = await CompanyRepository.getRawCompanyById(companyId);
        if (!company) {
            throw new NotFoundError("Company not found.");
        }
        if (company.deletedAt) {
            throw new ConflictError("Company has been deleted.");
        }
        const member = await CompanyRepository.membership(companyId, userId);
        if (!member) {
            throw new NotFoundError("Member not found.");
        }
        const updatedMember = await CompanyRepository.updateMembership(member.id, { role });
        return updatedMember;
    }
    static async removeCompanyMember(companyId, userIds) {
        const company = await CompanyRepository.getRawCompanyById(companyId);
        if (!company) {
            throw new NotFoundError("Company not found.");
        }
        if (company.deletedAt) {
            throw new ConflictError("Company has been deleted.");
        }
        const members = await CompanyRepository.findMembersByUserIds(companyId, userIds);
        if (members.length === 0) {
            throw new NotFoundError("No members found matching the criteria.");
        }
        const foundUserIds = new Set(members.map(member => member.userId));
        const invalidUsers = userIds.filter(id => !foundUserIds.has(id));
        if (invalidUsers.length > 0) {
            throw new NotFoundError(`These users are not members of this company: ${invalidUsers.join(", ")}`);
        }
        const { removedCount } = await CompanyRepository.removeMember(companyId, userIds);
        return { removedCount, removedMembers: members };
    }
    static async uploadLogo(companyId, file) {
        if (!file) {
            throw new ValidationError("No image file provided.", {
                logo: { _errors: ["A logo image file is required."] },
            });
        }
        if (!COMPANY_IMAGE_MIME_TYPES.includes(file.mimetype)) {
            throw new ValidationError("Invalid file type.", {
                logo: {
                    _errors: [
                        `Unsupported file type: ${file.mimetype}. Allowed: jpeg, jpg, png, svg, webp`,
                    ],
                },
            });
        }
        if (file.size > COMPANY_IMAGE_MAX_BYTES) {
            throw new ValidationError("File too large.", {
                logo: { _errors: ["Logo image must not exceed 5 MB."] },
            });
        }
        const company = await CompanyRepository.getRawCompanyById(companyId);
        if (!company) {
            throw new NotFoundError("Company not found.");
        }
        if (company.deletedAt) {
            throw new ConflictError("Company has been deleted.");
        }
        if (company.logo) {
            const publicId = extractPublicId(company.logo);
            if (publicId) {
                await deleteFileFromCloudinary({ publicId, resourceType: "image" }).catch((err) => {
                    logger.warn({ err, companyId }, "[Cloudinary] Failed to delete old logo — continuing.");
                });
            }
        }
        const uploaded = await uploadFileToCloudinary(file, {
            folder: "talentforge/company/logo",
            resourceType: "image",
        });
        const updated = await CompanyRepository.updateLogo(companyId, uploaded.secureUrl);
        ElasticsearchService.indexCompany(toCompanySearchView(updated)).catch((err) => {
            logger.error({ err, companyId }, "[ES] Failed to sync company after logo upload.");
        });
        return { logo: uploaded.secureUrl };
    }
    static async uploadCoverImage(companyId, file) {
        if (!file) {
            throw new ValidationError("No image file provided.", {
                cover: { _errors: ["A cover image file is required."] },
            });
        }
        if (!COMPANY_IMAGE_MIME_TYPES.includes(file.mimetype)) {
            throw new ValidationError("Invalid file type.", {
                cover: {
                    _errors: [
                        `Unsupported file type: ${file.mimetype}. Allowed: jpeg, jpg, png, svg, webp`,
                    ],
                },
            });
        }
        if (file.size > COMPANY_IMAGE_MAX_BYTES) {
            throw new ValidationError("File too large.", {
                cover: { _errors: ["Cover image must not exceed 5 MB."] },
            });
        }
        const company = await CompanyRepository.getRawCompanyById(companyId);
        if (!company) {
            throw new NotFoundError("Company not found.");
        }
        if (company.deletedAt) {
            throw new ConflictError("Company has been deleted.");
        }
        if (company.coverImage) {
            const publicId = extractPublicId(company.coverImage);
            if (publicId) {
                await deleteFileFromCloudinary({ publicId, resourceType: "image" }).catch((err) => {
                    logger.warn({ err, companyId }, "[Cloudinary] Failed to delete old cover — continuing.");
                });
            }
        }
        const uploaded = await uploadFileToCloudinary(file, {
            folder: "talentforge/company/cover",
            resourceType: "image",
        });
        const updated = await CompanyRepository.updateCoverImage(companyId, uploaded.secureUrl);
        ElasticsearchService.indexCompany(toCompanySearchView(updated)).catch((err) => {
            logger.error({ err, companyId }, "[ES] Failed to sync company after cover upload.");
        });
        return { coverImage: uploaded.secureUrl };
    }
    static async searchCompanies(params) {
        return ElasticsearchService.searchCompanies(params);
    }
    static async getValidCompany(companyId) {
        const company = await CompanyRepository.getRawCompanyById(companyId);
        if (!company) {
            throw new NotFoundError("Company not found.");
        }
        if (company.deletedAt) {
            throw new ConflictError("Company has been deleted.");
        }
        return company;
    }
    static async verifyCompany(companyId, verifiedBy) {
        const company = await this.getValidCompany(companyId);
        if (company.status === CompanyStatus.SUSPENDED) {
            throw new ConflictError("Suspended company cannot be verified.");
        }
        if (company.isVerified) {
            throw new ConflictError("Company is already verified.");
        }
        const verified = await CompanyRepository.verifyCompany(companyId, verifiedBy);
        ElasticsearchService.indexCompany(toCompanySearchView(verified)).catch((err) => {
            logger.error({ err, companyId }, "[ES] Failed to index verified company.");
        });
        return verified;
    }
    static async suspendCompany(companyId, suspendedBy, reason) {
        const company = await this.getValidCompany(companyId);
        if (company.status === CompanyStatus.SUSPENDED) {
            throw new ConflictError("Company is already suspended.");
        }
        const suspended = await CompanyRepository.suspendCompany(companyId, suspendedBy, reason);
        ElasticsearchService.removeCompany(companyId).catch((err) => {
            logger.error({ err, companyId }, "[ES] Failed to remove suspended company.");
        });
        return suspended;
    }
    static async restoreCompany(companyId, restoredBy) {
        const company = await this.getValidCompany(companyId);
        if (company.status !== CompanyStatus.SUSPENDED) {
            throw new ConflictError("Company is not suspended no need to restore the company");
        }
        const restored = await CompanyRepository.restoreCompany(companyId, restoredBy);
        ElasticsearchService.indexCompany(toCompanySearchView(restored)).catch((err) => {
            logger.error({ err, companyId }, "[ES] Failed to re-index restored company.");
        });
        return restored;
    }
    static async getAllCompanies() {
        return CompanyRepository.getAllCompanies();
    }
    static async cancelInvitation(invitationId, userId) {
        const invitation = await CompanyRepository.findInvitationById(invitationId);
        if (!invitation) {
            throw new NotFoundError("Invitation not found.");
        }
        const membership = await CompanyRepository.membership(invitation.companyId, userId);
        if (!membership || (membership.role !== CompanyMemberRole.OWNER && membership.role !== CompanyMemberRole.ADMIN)) {
            throw new ForbiddenError("You do not have permission to cancel invitations for this company.");
        }
        if (invitation.status === CompanyMemberStatus.ACTIVE) {
            throw new ConflictError("This invitation has already been accepted and cannot be cancelled.");
        }
        if (invitation.status === CompanyMemberStatus.CANCELLED) {
            throw new ConflictError("This invitation has already been cancelled.");
        }
        if (invitation.status === CompanyMemberStatus.REMOVED) {
            throw new ConflictError("This invitation has already been rejected.");
        }
        if (invitation.expiresAt && invitation.expiresAt < new Date()) {
            throw new ConflictError("This invitation has already expired.");
        }
        return CompanyRepository.cancelInvitation(invitationId);
    }
    static async resendInvitation(invitationId, userId) {
        const invitation = await CompanyRepository.findInvitationById(invitationId);
        if (!invitation) {
            throw new NotFoundError("Invitation not found.");
        }
        const membership = await CompanyRepository.membership(invitation.companyId, userId);
        if (!membership || (membership.role !== CompanyMemberRole.OWNER && membership.role !== CompanyMemberRole.ADMIN)) {
            throw new ForbiddenError("You do not have permission to resend invitations for this company.");
        }
        if (invitation.status === CompanyMemberStatus.ACTIVE) {
            throw new ConflictError("This invitation has already been accepted.");
        }
        if (invitation.status === CompanyMemberStatus.REMOVED) {
            throw new ConflictError("This invitation has already been rejected.");
        }
        if (invitation.status === CompanyMemberStatus.CANCELLED) {
            throw new ConflictError("This invitation has been cancelled and cannot be resent.");
        }
        const company = await CompanyRepository.getRawCompanyById(invitation.companyId);
        if (!company) {
            throw new NotFoundError("Company not found.");
        }
        if (company.deletedAt) {
            throw new ConflictError("Company has been deleted.");
        }
        const inviter = await AuthRepository.findProfileByUserId(userId);
        if (!inviter || !inviter.profile) {
            throw new NotFoundError("Inviter profile not found.");
        }
        const inviteeUser = await AuthRepository.findUserById(invitation.userId);
        const inviteeEmail = inviteeUser?.email ?? "";
        const token = InvitationTokenHelper.generateToken({
            companyId: invitation.companyId,
            inviteeEmail,
            invitedBy: userId,
            role: invitation.role,
        });
        const expiryMs = 7 * 24 * 60 * 60 * 1000;
        const expiresAt = new Date(Date.now() + expiryMs);
        const updated = await CompanyRepository.updateInvitationToken(invitationId, token, expiresAt);
        if (inviteeUser) {
            const invitationLink = `${env.app.frontendUrl}/invitations/accept?token=${token}`;
            const emailTemplate = emailTemplates.existingUserInvitationTemplate(company.companyName, inviter.profile.fullName, invitation.role, invitationLink);
            await EmailService.sendEmail({ to: inviteeEmail, ...emailTemplate });
        }
        else {
            const registerLink = `${env.app.frontendUrl}/register?invite=${token}`;
            const emailTemplate = emailTemplates.newUserInvitationTemplate(company.companyName, inviter.profile.fullName, invitation.role, registerLink);
            // inviteeEmail is empty for non-existing users — skip sending silently
            if (inviteeEmail) {
                await EmailService.sendEmail({ to: inviteeEmail, ...emailTemplate });
            }
        }
        return updated;
    }
    static async deactivateCompany(companyId, userId) {
        const company = await this.getValidCompany(companyId);
        const membership = await CompanyRepository.membership(companyId, userId);
        if (!membership || membership.role !== CompanyMemberRole.OWNER) {
            throw new ForbiddenError("Only the company owner can deactivate this company.");
        }
        if (company.status === CompanyStatus.INACTIVE) {
            throw new ConflictError("Company is already inactive.");
        }
        const deactivated = await CompanyRepository.deactivateCompany(companyId);
        ElasticsearchService.removeCompany(companyId).catch((err) => {
            logger.error({ err, companyId }, "[ES] Failed to remove deactivated company from index.");
        });
        return deactivated;
    }
    static async activateCompany(companyId, userId) {
        const company = await this.getValidCompany(companyId);
        const membership = await CompanyRepository.membership(companyId, userId);
        if (!membership || membership.role !== CompanyMemberRole.OWNER) {
            throw new ForbiddenError("Only the company owner can activate this company.");
        }
        if (company.status !== CompanyStatus.INACTIVE) {
            throw new ConflictError("Company is not inactive.");
        }
        const activated = await CompanyRepository.activateCompany(companyId);
        ElasticsearchService.indexCompany(toCompanySearchView(activated)).catch((err) => {
            logger.error({ err, companyId }, "[ES] Failed to index activated company.");
        });
        return activated;
    }
}
//# sourceMappingURL=company.service.js.map