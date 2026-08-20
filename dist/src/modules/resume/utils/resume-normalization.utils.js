import { EmploymentType } from "@prisma/client";
/**
 * Normalizes a raw string into a stable comparison key.
 * Strips whitespace, dots, dashes, slashes, and converts to lowercase.
 */
export function normalizeSkillLookupKey(raw) {
    if (!raw)
        return "";
    return raw
        .trim()
        .toLowerCase()
        .replace(/[\s._\-\/\\]+/g, "");
}
/**
 * Dictionary mapping normalized skill lookup keys to canonical display names.
 */
const SKILL_CANONICAL_MAP = {
    "react": "React",
    "reactjs": "React",
    "node": "Node.js",
    "nodejs": "Node.js",
    "typescript": "TypeScript",
    "ts": "TypeScript",
    "javascript": "JavaScript",
    "js": "JavaScript",
    "vue": "Vue.js",
    "vuejs": "Vue.js",
    "angular": "Angular",
    "angularjs": "Angular",
    "express": "Express.js",
    "expressjs": "Express.js",
    "next": "Next.js",
    "nextjs": "Next.js",
    "nest": "NestJS",
    "nestjs": "NestJS",
    "mongodb": "MongoDB",
    "mongo": "MongoDB",
    "postgresql": "PostgreSQL",
    "postgres": "PostgreSQL",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    "html": "HTML5",
    "html5": "HTML5",
    "css": "CSS3",
    "css3": "CSS3",
    "python": "Python",
    "java": "Java",
    "c++": "C++",
    "cpp": "C++",
    "c#": "C#",
    "csharp": "C#",
    "aws": "AWS",
    "amazonwebservices": "AWS",
    "gcp": "GCP",
    "googlecloudplatform": "GCP",
    "azure": "Azure",
    "microsoftazure": "Azure",
    "git": "Git",
    "github": "GitHub",
    "gitlab": "GitLab",
    "graphql": "GraphQL",
    "restapi": "REST API",
    "restfulapi": "REST API",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS"
};
/**
 * Trim whitespace and collapse multiple inline spaces into a single space.
 * Returns null if empty/null/undefined.
 */
export function normalizeString(val) {
    if (val === null || val === undefined)
        return null;
    const trimmed = val.trim().replace(/[ \t]+/g, " ");
    return trimmed.length > 0 ? trimmed : null;
}
/**
 * Normalizes a string for deduplication comparison by trimming, lowercasing, and stripping trailing punctuation.
 */
export function normalizeLookupKey(val) {
    if (!val)
        return "";
    return val
        .trim()
        .toLowerCase()
        .replace(/[.,;:\-\s]+$/g, "")
        .replace(/[ \t]+/g, " ");
}
/**
 * Normalize multi-line text (e.g. bio, descriptions).
 * Preserves newlines, collapses 3+ blank lines, trims lines.
 * Returns null if empty.
 */
export function normalizeText(val) {
    if (val === null || val === undefined)
        return null;
    const cleaned = val
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .split("\n")
        .map((line) => line.trim())
        .join("\n")
        .trim();
    return cleaned.length > 0 ? cleaned : null;
}
/**
 * Trim whitespace and convert email to lowercase without altering internal mailbox structure.
 */
export function normalizeEmail(email) {
    const cleaned = normalizeString(email);
    if (!cleaned)
        return null;
    return cleaned.toLowerCase();
}
/**
 * Trim whitespace and collapse formatting spaces in phone numbers while preserving country codes (+), digits, and spaces.
 */
export function normalizePhone(phone) {
    const cleaned = normalizeString(phone);
    if (!cleaned)
        return null;
    return cleaned.replace(/[ \t]+/g, " ");
}
/**
 * Trim whitespace for URLs without guessing missing protocols.
 */
export function normalizeUrl(url) {
    return normalizeString(url);
}
/**
 * Normalize and canonicalize skill names using exact lookup key matching.
 * Avoids dangerous substring collisions (e.g., "React Native" remains "React Native").
 */
export function normalizeSkillName(name) {
    const cleaned = normalizeString(name);
    if (!cleaned)
        return null;
    const lookupKey = normalizeSkillLookupKey(cleaned);
    if (Object.prototype.hasOwnProperty.call(SKILL_CANONICAL_MAP, lookupKey)) {
        return SKILL_CANONICAL_MAP[lookupKey];
    }
    return cleaned;
}
/**
 * Deterministically normalizes date strings.
 * Maps variants of "Present" ("present", "CURRENT", "now") to "Present".
 * Normalizes month capitalization ("jan 2022" -> "Jan 2022") without guessing full dates.
 */
export function normalizeDateString(dateStr) {
    const cleaned = normalizeString(dateStr);
    if (!cleaned)
        return null;
    const lower = cleaned.toLowerCase();
    if (["present", "current", "currently", "now", "ongoing"].includes(lower)) {
        return "Present";
    }
    // Capitalize month names if pattern matches "month year" or "month, year"
    const monthMatch = cleaned.match(/^([a-zA-Z]{3,9})[\s,]+(\d{4})$/);
    if (monthMatch && monthMatch[1] && monthMatch[2]) {
        const month = monthMatch[1].charAt(0).toUpperCase() + monthMatch[1].slice(1).toLowerCase();
        return `${month} ${monthMatch[2]}`;
    }
    return cleaned;
}
/**
 * Normalizes employment type strings/enums to canonical EmploymentType enum values.
 */
export function normalizeEmploymentType(val) {
    if (!val)
        return null;
    if (Object.values(EmploymentType).includes(val)) {
        return val;
    }
    const clean = val.trim().toLowerCase().replace(/[\s\-_]+/g, "");
    switch (clean) {
        case "fulltime":
        case "full":
            return EmploymentType.FULL_TIME;
        case "parttime":
        case "part":
            return EmploymentType.PART_TIME;
        case "contract":
        case "contractor":
            return EmploymentType.CONTRACT;
        case "intern":
        case "internship":
            return EmploymentType.INTERN;
        case "freelance":
        case "freelancer":
            return EmploymentType.FREELANCE;
        case "temporary":
        case "temp":
            return EmploymentType.TEMPORARY;
        case "apprenticeship":
        case "apprentice":
            return EmploymentType.APPRENTICESHIP;
        default:
            return null;
    }
}
//# sourceMappingURL=resume-normalization.utils.js.map