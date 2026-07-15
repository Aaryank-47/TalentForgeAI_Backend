const PROFILE_FIELDS = [
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
export function calculateProfileCompletion(company) {
    const filled = PROFILE_FIELDS.filter((field) => {
        const value = company[field];
        return value !== null && value !== undefined && value !== "";
    }).length;
    return Math.round((filled / PROFILE_FIELDS.length) * 100);
}
export function omitUndefined(obj) {
    return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));
}
export const invitationTokenGeneration = crypto.randomUUID();
export function extractPublicId(url) {
    try {
        const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
        return (match?.[1]) ?? null;
    }
    catch {
        return null;
    }
}
export function toCompanySearchView(company) {
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
        status: company.status ?? "DRAFT",
        visibility: company.visibility ?? "PUBLIC",
        isVerified: company.isVerified,
        verifiedAt: company.verifiedAt,
        verifiedBy: company.verifiedBy,
        restoredAt: company.restoredAt ?? null,
        restoredBy: company.restoredBy ?? null,
        profileCompletion: company.profileCompletion,
        createdAt: company.createdAt.toISOString(),
        updatedAt: company.updatedAt.toISOString(),
    };
}
//# sourceMappingURL=company.utils.js.map