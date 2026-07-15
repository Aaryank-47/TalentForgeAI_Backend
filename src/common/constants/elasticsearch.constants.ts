export const ES_INDICES = {
    COMPANIES: "talentforge_companies",
} as const;

export const ES_COMPANY_FIELDS = {
    COMPANY_NAME: "companyName",
    INDUSTRY: "industry",
    DESCRIPTION: "description",
    HEADQUARTERS: "headquarters",
    WEBSITE: "website",
} as const;

export const ES_COMPANY_BOOSTS = {
    COMPANY_NAME: 5,
    INDUSTRY: 3,
    DESCRIPTION: 2,
    HEADQUARTERS: 2,
    WEBSITE: 1,
} as const;

export const ES_MAX_RESULT_WINDOW = 10_000;

export const ES_COMPANY_MAPPINGS = {
    properties: {
        id: { type: "keyword" },
        companyName: { type: "text", analyzer: "standard" },
        slug: { type: "keyword" },
        industry: { type: "text", analyzer: "standard" },
        description: { type: "text", analyzer: "standard" },
        headquarters: { type: "text", analyzer: "standard" },
        website: { type: "text", analyzer: "standard" },
        companySize: { type: "keyword" },
        status: { type: "keyword" },
        visibility: { type: "keyword" },
        isVerified: { type: "boolean" },
        profileCompletion: { type: "integer" },
        logo: { type: "keyword", index: false },
        coverImage: { type: "keyword", index: false },
        companyEmail: { type: "keyword" },
        phoneNumber: { type: "keyword" },
        foundedYear: { type: "integer" },
        linkedinUrl: { type: "keyword", index: false },
        twitterUrl: { type: "keyword", index: false },
        createdAt: { type: "date" },
        updatedAt: { type: "date" },
    },
} as const;
