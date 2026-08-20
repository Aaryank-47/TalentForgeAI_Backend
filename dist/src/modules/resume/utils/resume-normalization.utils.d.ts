import { EmploymentType } from "@prisma/client";
/**
 * Normalizes a raw string into a stable comparison key.
 * Strips whitespace, dots, dashes, slashes, and converts to lowercase.
 */
export declare function normalizeSkillLookupKey(raw: string): string;
/**
 * Trim whitespace and collapse multiple inline spaces into a single space.
 * Returns null if empty/null/undefined.
 */
export declare function normalizeString(val: string | null | undefined): string | null;
/**
 * Normalizes a string for deduplication comparison by trimming, lowercasing, and stripping trailing punctuation.
 */
export declare function normalizeLookupKey(val: string | null | undefined): string;
/**
 * Normalize multi-line text (e.g. bio, descriptions).
 * Preserves newlines, collapses 3+ blank lines, trims lines.
 * Returns null if empty.
 */
export declare function normalizeText(val: string | null | undefined): string | null;
/**
 * Trim whitespace and convert email to lowercase without altering internal mailbox structure.
 */
export declare function normalizeEmail(email: string | null | undefined): string | null;
/**
 * Trim whitespace and collapse formatting spaces in phone numbers while preserving country codes (+), digits, and spaces.
 */
export declare function normalizePhone(phone: string | null | undefined): string | null;
/**
 * Trim whitespace for URLs without guessing missing protocols.
 */
export declare function normalizeUrl(url: string | null | undefined): string | null;
/**
 * Normalize and canonicalize skill names using exact lookup key matching.
 * Avoids dangerous substring collisions (e.g., "React Native" remains "React Native").
 */
export declare function normalizeSkillName(name: string): string | null;
/**
 * Deterministically normalizes date strings.
 * Maps variants of "Present" ("present", "CURRENT", "now") to "Present".
 * Normalizes month capitalization ("jan 2022" -> "Jan 2022") without guessing full dates.
 */
export declare function normalizeDateString(dateStr: string | null | undefined): string | null;
/**
 * Normalizes employment type strings/enums to canonical EmploymentType enum values.
 */
export declare function normalizeEmploymentType(val: EmploymentType | string | null | undefined): EmploymentType | null;
//# sourceMappingURL=resume-normalization.utils.d.ts.map