import type { Company } from "@prisma/client";
import type { CompanyView, CompanySearchView } from "../interfaces/company.interface.js";

const PROFILE_FIELDS: (keyof Company)[] = [
    "companyEmail",
    "phoneNumber",
    "website",
    "logo",
    "coverImage",
    "description",
    "industry",
    "companySize",
    "foundedYear",
    "headquarters",
    "linkedinUrl",
    "twitterUrl",
];

export function calculateProfileCompletion(company: Company): number {
    const filled = PROFILE_FIELDS.filter((field) => {
        const value = company[field];
        return value !== null && value !== undefined && value !== "";
    }).length;

    return Math.round((filled / PROFILE_FIELDS.length) * 100);
}

export function omitUndefined<T extends object>(obj: T) {
    return Object.fromEntries(
        Object.entries(obj).filter(([, value]) => value !== undefined)
    ) as {
        [K in keyof T as T[K] extends undefined ? never : K]: Exclude<T[K], undefined>;
    };
}

export const invitationTokenGeneration = crypto.randomUUID();

export function extractPublicId(url: string): string | null {
    try {
        const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
        return (match?.[1]) ?? null;
    } catch {
        return null;
    }
}

export function toCompanySearchView(company: CompanyView & { status?: string; visibility?: string }): CompanySearchView {
    return {
        id: company.id,
        companyName: company.companyName,
        slug: company.slug,
        industry: company.industry ?? null,
        description: company.description ?? null,
        headquarters: company.headquarters ?? null,
        website: company.website ?? null,
        companySize: company.companySize ?? null,
        companyEmail: company.companyEmail ?? null,
        phoneNumber: company.phoneNumber ?? null,
        logo: company.logo ?? null,
        coverImage: company.coverImage ?? null,
        foundedYear: company.foundedYear ?? null,
        linkedinUrl: company.linkedinUrl ?? null,
        twitterUrl: company.twitterUrl ?? null,
        status: (company as any).status ?? "DRAFT",
        visibility: (company as any).visibility ?? "PUBLIC",
        isVerified: company.isVerified,
        verifiedAt: company.verifiedAt,
        verifiedBy: company.verifiedBy,
        profileCompletion: company.profileCompletion,
        createdAt: company.createdAt.toISOString(),
        updatedAt: company.updatedAt.toISOString(),
    };
}