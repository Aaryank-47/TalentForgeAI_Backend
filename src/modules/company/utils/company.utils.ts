import type { Company } from "@prisma/client";

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
