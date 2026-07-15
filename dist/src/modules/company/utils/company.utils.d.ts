import type { Company } from "@prisma/client";
import type { CompanyView, CompanySearchView } from "../interfaces/company.interface.js";
export declare function calculateProfileCompletion(company: Company): number;
export declare function omitUndefined<T extends object>(obj: T): { [K in keyof T as T[K] extends undefined ? never : K]: Exclude<T[K], undefined>; };
export declare const invitationTokenGeneration: `${string}-${string}-${string}-${string}-${string}`;
export declare function extractPublicId(url: string): string | null;
export declare function toCompanySearchView(company: CompanyView & {
    status?: string;
    visibility?: string;
}): CompanySearchView;
//# sourceMappingURL=company.utils.d.ts.map