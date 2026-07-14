import prisma from "../../../config/database.js";
import { companySelect, companyMemberSelect } from "../../../common/prisma.select/company.select.js";
import { CompanyMemberRole, CompanyMemberStatus, CompanyStatus, type Prisma } from "@prisma/client";
import type { CreateCompanyInput, UpdateCompanyInput, CompanyMemberList, CompanyMemberDetails } from "../interfaces/company.interface.js";
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
}