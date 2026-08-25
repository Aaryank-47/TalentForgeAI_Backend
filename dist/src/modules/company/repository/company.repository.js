import prisma from "../../../config/database.js";
import { companySelect, companyMemberSelect, companyInvitationSelect, invitationSelect } from "../../../common/prisma.select/company.select.js";
import { CompanyMemberRole, CompanyMemberStatus, CompanyStatus } from "@prisma/client";
export class CompanyRepository {
    static async findCompanyBySlug(slug) {
        return prisma.company.findUnique({
            where: { slug },
        });
    }
    static async createCompany(input) {
        return prisma.$transaction(async (tx) => {
            const company = await tx.company.create({
                data: {
                    companyName: input.companyName,
                    slug: input.slug,
                    companyEmail: input.companyEmail ?? null,
                    phoneNumber: input.phoneNumber ?? null,
                    website: input.website ?? null,
                    industry: input.industry ?? null,
                    companySize: input.companySize ?? null,
                    headquarters: input.headquarters ?? null,
                    description: input.description ?? null,
                    logo: input.logo ?? null,
                    foundedYear: input.foundedYear ?? null,
                    linkedinUrl: input.linkedinUrl ?? null,
                    twitterUrl: input.twitterUrl ?? null,
                },
                select: companySelect,
            });
            await tx.companyMember.create({
                data: {
                    userId: input.userId,
                    companyId: company.id,
                    role: CompanyMemberRole.OWNER,
                    status: CompanyMemberStatus.ACTIVE,
                },
            });
            return company;
        });
    }
    static async getMyCompanies(userId) {
        return prisma.company.findMany({
            where: {
                companyMembers: {
                    some: {
                        userId,
                        status: CompanyMemberStatus.ACTIVE,
                    },
                },
            },
            select: companySelect,
        });
    }
    static async findCompanyById(companyId) {
        return prisma.company.findUnique({
            where: { id: companyId },
            select: companySelect,
        });
    }
    static async findCompanyMemberById(companyMemberId) {
        return prisma.companyMember.findUnique({
            where: { id: companyMemberId },
        });
    }
    static async findMemberByUserAndCompany(userId, companyId) {
        return prisma.companyMember.findUnique({
            where: {
                userId_companyId: { userId, companyId },
                status: CompanyMemberStatus.ACTIVE,
            },
        });
    }
    static async findActiveMembershipsByUser(userId) {
        return prisma.companyMember.findMany({
            where: {
                userId,
                status: CompanyMemberStatus.ACTIVE
            },
            select: {
                companyId: true
            }
        });
    }
    static async updateCompanyProfile(companyId, input) {
        return prisma.company.update({
            where: { id: companyId },
            data: input,
            select: companySelect,
        });
    }
    static async getRawCompanyById(companyId) {
        return prisma.company.findUnique({
            where: { id: companyId },
        });
    }
    static async membership(companyId, userId) {
        const member = await prisma.companyMember.findUnique({
            where: {
                userId_companyId: { userId, companyId }
            }
        });
        console.log("member : ", member);
        return member
            ? {
                ...member,
                invitedBy: member.invitedBy ?? "",
            }
            : null;
    }
    static async findMemberWithDetails(companyId, userId) {
        return prisma.companyMember.findUnique({
            where: {
                userId_companyId: { userId, companyId }
            },
            select: companyMemberSelect
        });
    }
    static async deleteCompany(companyId, userId) {
        return prisma.company.update({
            where: {
                id: companyId
            },
            data: {
                deletedAt: new Date(),
                deletedBy: userId,
                status: CompanyStatus.SUSPENDED
            },
            select: companySelect,
        });
    }
    static async createInvitedMember(data) {
        return prisma.companyMember.create({
            data: {
                userId: data.userId,
                companyId: data.companyId,
                role: data.role,
                status: CompanyMemberStatus.INVITED,
                invitedBy: data.invitedBy,
                invitationToken: data.invitationToken ?? null,
                invitedAt: data.invitedAt ?? null,
                expiresAt: data.expiresAt ?? null,
            },
        });
    }
    static async listAllInvitations(companyId) {
        const invitations = await prisma.companyMember.findMany({
            where: {
                companyId: companyId,
                status: CompanyMemberStatus.INVITED
            },
            select: companyInvitationSelect,
        });
        return invitations.map((member) => ({
            id: member.user.id,
            email: member.user.email,
            fullName: member.user.employer?.fullName ??
                member.user.candidate?.fullName ??
                "Unknown"
        }));
    }
    static async updateMembership(membershipId, data) {
        return prisma.companyMember.update({
            where: {
                id: membershipId,
            },
            data,
        });
    }
    static async listAllMembers(companyId) {
        return prisma.companyMember.findMany({
            where: {
                companyId: companyId
            },
            select: companyMemberSelect
        });
    }
    static async removeMember(companyId, userIds) {
        const members = await prisma.companyMember.findMany({
            where: {
                companyId,
                userId: {
                    in: userIds
                }
            }
        });
        const deleteResult = await prisma.companyMember.deleteMany({
            where: {
                companyId,
                userId: {
                    in: userIds
                }
            }
        });
        return {
            removedCount: deleteResult.count,
            removedMembers: members
        };
    }
    static async findMembersByUserIds(companyId, userIds) {
        return prisma.companyMember.findMany({
            where: {
                companyId,
                userId: {
                    in: userIds
                }
            }
        });
    }
    static async findMembersByIds(memberIds) {
        return prisma.companyMember.findMany({
            where: {
                id: {
                    in: memberIds
                }
            }
        });
    }
    static async updateLogo(companyId, logoUrl) {
        return prisma.company.update({
            where: { id: companyId },
            data: { logo: logoUrl },
            select: companySelect,
        });
    }
    static async updateCoverImage(companyId, coverUrl) {
        return prisma.company.update({
            where: { id: companyId },
            data: { coverImage: coverUrl },
            select: companySelect,
        });
    }
    static async verifyCompany(companyId, verifiedBy) {
        return prisma.company.update({
            where: {
                id: companyId
            },
            data: {
                isVerified: true,
                verifiedAt: new Date(),
                verifiedBy: verifiedBy,
                status: CompanyStatus.ACTIVE,
            },
            select: companySelect
        });
    }
    static async suspendCompany(companyId, suspendedBy, reason) {
        return prisma.company.update({
            where: {
                id: companyId
            },
            data: {
                status: CompanyStatus.SUSPENDED,
                suspendedAt: new Date(),
                suspendedBy: suspendedBy,
                suspendedReason: reason,
            },
            select: companySelect
        });
    }
    static async restoreCompany(companyId, restoredBy) {
        return prisma.company.update({
            where: {
                id: companyId
            },
            data: {
                status: CompanyStatus.ACTIVE,
                restoredAt: new Date(),
                restoredBy: restoredBy,
                suspendedAt: null,
                suspendedBy: null,
                suspendedReason: null,
            },
            select: companySelect
        });
    }
    static async getAllCompanies() {
        return prisma.company.findMany({
            where: {
                deletedAt: null,
                status: CompanyStatus.ACTIVE,
                isVerified: true,
            },
            select: companySelect,
        });
    }
    static async findInvitationById(invitationId) {
        return prisma.companyMember.findUnique({
            where: { id: invitationId },
            select: invitationSelect,
        });
    }
    static async findMemberByInvitationToken(invitationToken) {
        const member = await prisma.companyMember.findUnique({
            where: { invitationToken },
        });
        return member
            ? {
                ...member,
                invitedBy: member.invitedBy ?? "",
            }
            : null;
    }
    static async cancelInvitation(invitationId) {
        return prisma.companyMember.update({
            where: { id: invitationId },
            data: {
                status: CompanyMemberStatus.CANCELLED,
                invitationToken: null,
                expiresAt: new Date(),
            },
            select: { id: true, status: true },
        });
    }
    static async updateInvitationToken(invitationId, token, expiresAt) {
        return prisma.companyMember.update({
            where: { id: invitationId },
            data: {
                status: CompanyMemberStatus.INVITED,
                invitationToken: token,
                invitedAt: new Date(),
                expiresAt,
            },
            select: { id: true, status: true, expiresAt: true },
        });
    }
    static async deactivateCompany(companyId) {
        return prisma.company.update({
            where: { id: companyId },
            data: { status: CompanyStatus.INACTIVE },
            select: companySelect,
        });
    }
    static async activateCompany(companyId) {
        return prisma.company.update({
            where: { id: companyId },
            data: { status: CompanyStatus.ACTIVE },
            select: companySelect,
        });
    }
    static async findCompanyByName(companyName) {
        return prisma.company.findFirst({
            where: {
                companyName: {
                    equals: companyName,
                    mode: 'insensitive'
                }
            }
        });
    }
}
//# sourceMappingURL=company.repository.js.map