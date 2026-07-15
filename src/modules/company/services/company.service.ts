import type { CreateCompanyDto, UpdateCompanyDto, SearchCompanyDto } from "../dto/company.dto.js";
import type { CompanyView } from "../repository/company.repository.js";
import { AuthRepository } from "../../auth/repositories/auth.repository.js";
import { CompanyRepository } from "../repository/company.repository.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ForbiddenError } from "../../../common/errors/ForbiddenError.js";
import { ValidationError } from "../../../common/errors/ValidationError.js";
import { slugifyText } from "../../auth/utils/auth.utils.js";
import { calculateProfileCompletion, omitUndefined } from "../utils/company.utils.js";
import { CompanyMemberRole, UserRole, CompanyMemberStatus } from "@prisma/client";
import { emailTemplates } from "../../../common/email/email.templates.js"
import { EmailService } from "../../../common/email/email.service.js";
import { InvitationTokenHelper } from "../utils/invitationToken.util.js";
import { env } from "../../../config/env.js";
import type {
    InvitationResponse,
    CompanyMemberDetails,
    CompanyMemberList,
    RemoveCompanyMembersResponse,
    UploadCompanyLogoResult,
    UploadCompanyCoverResult,
    SearchCompanyResult,
    CompanyDetails
} from "../interfaces/company.interface.js";
import { UnauthorizedError } from "../../../common/errors/UnauthorizedError.js";
import { ElasticsearchService } from "./elasticsearch.service.js";
import { uploadFileToCloudinary } from "../../../common/helper/upload.helper.js";
import { deleteFileFromCloudinary } from "../../../common/helper/delete.helper.js";
import { logger } from "../../../common/logger/logger.js";
import { COMPANY_IMAGE_MIME_TYPES, COMPANY_IMAGE_MAX_BYTES } from "../constants/company.contants.js"
import { extractPublicId, toCompanySearchView } from "../utils/company.utils.js"

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

        ElasticsearchService.indexCompany(toCompanySearchView(newCompany)).catch((err) => {
            logger.error({ err, companyId: newCompany.id }, "[ES] Failed to index new company.");
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

        ElasticsearchService.indexCompany(toCompanySearchView(updated)).catch((err) => {
            logger.error({ err, companyId }, "[ES] Failed to sync updated company.");
        });

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

    static async acceptOrRejectInvitation(
        token: string,
        userId: string,
        action: string
    ): Promise<void> {

        const payload = InvitationTokenHelper.verifyToken(token);
        const company = await CompanyRepository.findCompanyById(
            payload.companyId
        );

        if (!company) {
            throw new NotFoundError("Company not found.");
        }

        if (company.deletedAt) {
            throw new ConflictError(
                "This company is no longer accepting invitations."
            );
        }

        const invitee = await AuthRepository.findUserById(userId);

        if (!invitee) {
            throw new UnauthorizedError("Authenticated user not found.");
        }

        if (invitee.email !== payload.inviteeEmail) {
            throw new ForbiddenError(
                "This invitation does not belong to your account."
            );
        }

        const membership = await CompanyRepository.membership(
            payload.companyId,
            userId
        );

        if (!membership) {
            throw new NotFoundError(
                "Invitation record not found."
            );
        }

        switch (membership.status) {

            case CompanyMemberStatus.ACTIVE:
                throw new ConflictError(
                    "You are already a member of this company."
                );

            case CompanyMemberStatus.SUSPENDED:
                throw new ConflictError(
                    "Your membership has been suspended."
                );

            case CompanyMemberStatus.LEFT:
                throw new ConflictError(
                    "This invitation is no longer valid."
                );

            case CompanyMemberStatus.REMOVED:
                throw new ConflictError(
                    "This invitation has already been rejected."
                );

            case CompanyMemberStatus.INVITED:
                break;
        }

        if (action === "accept") {

            await CompanyRepository.updateMembership(
                membership.id,
                {
                    status: CompanyMemberStatus.ACTIVE,
                    joinedAt: new Date(),
                }
            );

            return;
        }

        await CompanyRepository.updateMembership(
            membership.id,
            {
                status: CompanyMemberStatus.REMOVED,
            }
        );
    }

    static async listAllCompanyMembers(
        companyId: string
    ): Promise<CompanyMemberDetails[]> {
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

    static async updateCompanyMemberRole(
        companyId: string,
        userId: string,
        role: CompanyMemberRole
    ): Promise<CompanyMemberList> {
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

    static async removeCompanyMember(
        companyId: string,
        userIds: string[]
    ): Promise<RemoveCompanyMembersResponse> {

        const company = await CompanyRepository.getRawCompanyById(companyId);
        if (!company) {
            throw new NotFoundError("Company not found.");
        }

        if (company.deletedAt) {
            throw new ConflictError("Company has been deleted.");
        }
        const members = await CompanyRepository.findMembersByUserIds(
            companyId,
            userIds
        );

        if (members.length === 0) {
            throw new NotFoundError("No members found matching the criteria.");
        }

        const foundUserIds = new Set(
            members.map(member => member.userId)
        );

        const invalidUsers = userIds.filter(
            id => !foundUserIds.has(id)
        );

        if (invalidUsers.length > 0) {
            throw new NotFoundError(
                `These users are not members of this company: ${invalidUsers.join(", ")}`
            );
        }

        const { removedCount } = await CompanyRepository.removeMember(companyId, userIds);

        return { removedCount, removedMembers: members };
    }


    static async uploadLogo(
        companyId: string,
        file: Express.Multer.File
    ): Promise<UploadCompanyLogoResult> {
        if (!file) {
            throw new ValidationError("No image file provided.", {
                logo: { _errors: ["A logo image file is required."] },
            });
        }

        if (!(COMPANY_IMAGE_MIME_TYPES as readonly string[]).includes(file.mimetype)) {
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

    static async uploadCoverImage(
        companyId: string,
        file: Express.Multer.File
    ): Promise<UploadCompanyCoverResult> {
        if (!file) {
            throw new ValidationError("No image file provided.", {
                cover: { _errors: ["A cover image file is required."] },
            });
        }

        if (!(COMPANY_IMAGE_MIME_TYPES as readonly string[]).includes(file.mimetype)) {
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

    static async searchCompanies(
        params: SearchCompanyDto
    ): Promise<SearchCompanyResult> {
        return ElasticsearchService.searchCompanies(params);
    }

    static async verifyCompany(
        companyId: string,
        verifiedBy: string
    ): Promise<CompanyDetails> {
        const company = await CompanyRepository.getRawCompanyById(companyId);
        if (!company) {
            throw new NotFoundError("Company not found.");
        }
        if (company.deletedAt) {
            throw new ConflictError("Company has been deleted.");
        }
        if (company.isVerified) {
            throw new ConflictError("Company is already verified.");
        }

        const verified = await CompanyRepository.verifyCompany(
            companyId,
            verifiedBy
        );

        ElasticsearchService.indexCompany(toCompanySearchView(verified)).catch((err) => {
            logger.error({ err, companyId }, "[ES] Failed to sync company after verification.");
        });

        return verified;
    }
}
