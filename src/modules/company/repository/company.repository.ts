import prisma from "../../../config/database.js";
import { companySelect, companyMemberSelect, companyInvitationSelect, invitationSelect } from "../../../common/prisma.select/company.select.js";
import { CompanyMemberRole, CompanyMemberStatus, CompanyStatus, type Prisma } from "@prisma/client";
import type {
    CreateCompanyInput,
    UpdateCompanyInput,
    CompanyMemberList,
    CompanyMemberDetails,
    RemoveCompanyMembersResponse,
    CompanyInvitationView,
    InvitationView,
    CancelInvitationResult,
    ResendInvitationResult,
} from "../interfaces/company.interface.js";
import type { Company } from "@prisma/client";

export type CompanyView = Prisma.CompanyGetPayload<{ select: typeof companySelect }>;

export class CompanyRepository {
    static async findCompanyBySlug(
        slug: string
    ): Promise<Company | null> {
        return prisma.company.findUnique({
            where: { slug },
        });
    }


    static async createCompany(
        input: CreateCompanyInput
    ): Promise<CompanyView> {
        return prisma.$transaction(async (tx) => {
            const company = await tx.company.create({
                data: {
                    companyName: input.companyName,
                    slug: input.slug,
                    companyEmail: input.companyEmail ?? null,
                    phoneNumber: input.phoneNumber ?? null,
                    website: input.website ?? null,
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

    static async getMyCompanies(
        userId: string
    ): Promise<CompanyView[]> {
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

    static async findCompanyById(
        companyId: string
    ): Promise<CompanyView | null> {
        return prisma.company.findUnique({
            where: { id: companyId },
            select: companySelect,
        });
    }

    static async findCompanyMemberById(
        companyMemberId: string
    ) {
        return prisma.companyMember.findUnique({
            where: { id: companyMemberId },
        });
    }

    static async findMemberByUserAndCompany(
        userId: string,
        companyId: string
    ) {
        return prisma.companyMember.findUnique({
            where: {
                userId_companyId: { userId, companyId },
                status: CompanyMemberStatus.ACTIVE,
            },
        });
    }

    static async updateCompanyProfile(
        companyId: string,
        input: UpdateCompanyInput
    ): Promise<CompanyView> {
        return prisma.company.update({
            where: { id: companyId },
            data: input,
            select: companySelect,
        });
    }

    static async getRawCompanyById(
        companyId: string
    ): Promise<Company | null> {
        return prisma.company.findUnique({
            where: { id: companyId },
        });
    }

    static async membership(
        companyId: string,
        userId: string,
    ): Promise<CompanyMemberList | null> {
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

    static async deleteCompany(
        companyId: string,
        userId: string
    ): Promise<CompanyView> {
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
        })
    }

    static async createInvitedMember(data: {
        userId: string;
        companyId: string;
        role: CompanyMemberRole;
        invitedBy: string;
    }): Promise<CompanyMemberList> {
        return prisma.companyMember.create({
            data: {
                userId: data.userId,
                companyId: data.companyId,
                role: data.role,
                status: CompanyMemberStatus.INVITED,
                invitedBy: data.invitedBy,
            },
        });
    }

    static async listAllInvitations(
        companyId: string
    ): Promise<CompanyInvitationView[]> {
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
            fullName:
                member.user.employer?.fullName ??
                member.user.candidate?.fullName ??
                "Unknown"
        }));
    }

    static async updateMembership(
        membershipId: string,
        data: Prisma.CompanyMemberUpdateInput
    ): Promise<CompanyMemberList> {
        return prisma.companyMember.update({
            where: {
                id: membershipId,
            },
            data,
        });
    }

    static async listAllMembers(
        companyId: string
    ): Promise<CompanyMemberDetails[]> {
        return prisma.companyMember.findMany({
            where: {
                companyId: companyId
            },
            select: companyMemberSelect
        })
    }

    static async removeMember(
        companyId: string,
        userIds: string[]
    ): Promise<RemoveCompanyMembersResponse> {
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

    static async findMembersByUserIds(
        companyId: string,
        userIds: string[]
    ): Promise<CompanyMemberList[]> {
        return prisma.companyMember.findMany({
            where: {
                companyId,
                userId: {
                    in: userIds
                }
            }
        });
    }

    static async updateLogo(
        companyId: string,
        logoUrl: string
    ): Promise<CompanyView> {
        return prisma.company.update({
            where: { id: companyId },
            data: { logo: logoUrl },
            select: companySelect,
        });
    }

    static async updateCoverImage(
        companyId: string,
        coverUrl: string
    ): Promise<CompanyView> {
        return prisma.company.update({
            where: { id: companyId },
            data: { coverImage: coverUrl },
            select: companySelect,
        });
    }

    static async verifyCompany(
        companyId: string,
        verifiedBy: string
    ): Promise<CompanyView> {
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
        })
    }

    static async suspendCompany(
        companyId: string,
        suspendedBy: string,
        reason: string
    ): Promise<CompanyView> {
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
        })
    }

    static async restoreCompany(
        companyId: string,
        restoredBy: string
    ): Promise<CompanyView> {
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
        })
    }

    static async getAllCompanies(): Promise<CompanyView[]> {
        return prisma.company.findMany({
            where: {
                deletedAt: null,
                status: CompanyStatus.ACTIVE,
                isVerified: true,
            },
            select: companySelect,
        });
    }

    static async findInvitationById(
        invitationId: string
    ): Promise<InvitationView | null> {
        return prisma.companyMember.findUnique({
            where: { id: invitationId },
            select: invitationSelect,
        });
    }

    static async cancelInvitation(
        invitationId: string
    ): Promise<CancelInvitationResult> {
        return prisma.companyMember.update({
            where: { id: invitationId },
            data: { status: CompanyMemberStatus.CANCELLED },
            select: { id: true, status: true },
        });
    }

    static async updateInvitationToken(
        invitationId: string,
        token: string,
        expiresAt: Date
    ): Promise<ResendInvitationResult> {
        return prisma.companyMember.update({
            where: { id: invitationId },
            data: {
                invitationToken: token,
                invitedAt: new Date(),
                expiresAt,
            },
            select: { id: true, status: true, expiresAt: true },
        });
    }

    static async deactivateCompany(
        companyId: string
    ): Promise<CompanyView> {
        return prisma.company.update({
            where: { id: companyId },
            data: { status: CompanyStatus.INACTIVE },
            select: companySelect,
        });
    }

    static async activateCompany(
        companyId: string
    ): Promise<CompanyView> {
        return prisma.company.update({
            where: { id: companyId },
            data: { status: CompanyStatus.ACTIVE },
            select: companySelect,
        });
    }

    static async findCompanyByName(
        companyName: string
    ): Promise<Company | null> {
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