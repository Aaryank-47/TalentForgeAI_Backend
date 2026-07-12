import prisma from "../../../config/database.js";
import { companySelect } from "../../../common/prisma.select/company.select.js";
import { CompanyMemberRole, CompanyMemberStatus, CompanyStatus ,type Prisma } from "@prisma/client";
import type { CreateCompanyInput, UpdateCompanyInput, CompanyMemberList } from "../interfaces/company.interface.js";
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
        const member = await prisma.companyMember.findFirst({
            where: {
                companyId,
                userId,
                role: CompanyMemberRole.OWNER
            }
        });

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
}