import prisma from "../../../config/database.js";
import { companySelect } from "../../../common/prisma.select/company.select.js";
import { CompanyMemberRole, CompanyMemberStatus, type Prisma } from "@prisma/client";
import type { CreateCompanyInput } from "../interfaces/company.interface.js";
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
}