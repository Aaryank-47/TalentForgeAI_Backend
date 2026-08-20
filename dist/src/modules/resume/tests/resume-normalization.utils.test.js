import { describe, expect, it } from "@jest/globals";
import { EmploymentType } from "@prisma/client";
import { normalizeDateString, normalizeEmail, normalizeEmploymentType, normalizeLookupKey, normalizePhone, normalizeSkillLookupKey, normalizeSkillName, normalizeString, normalizeText, normalizeUrl } from "../utils/resume-normalization.utils.js";
describe("Resume Normalization Utils Unit Tests", () => {
    describe("normalizeString & normalizeText", () => {
        it("should trim and collapse multiple inline spaces", () => {
            expect(normalizeString("  John   Doe  ")).toBe("John Doe");
            expect(normalizeString("   ")).toBeNull();
            expect(normalizeString(null)).toBeNull();
        });
        it("should preserve newlines in multi-line text and collapse repeated blank lines", () => {
            const raw = "  Bio line 1   \r\n\r\n\r\n\r\n  Bio line 2  ";
            expect(normalizeText(raw)).toBe("Bio line 1\n\nBio line 2");
        });
    });
    describe("normalizeEmail", () => {
        it("should convert email to lowercase and trim spaces", () => {
            expect(normalizeEmail("  John@Example.COM  ")).toBe("john@example.com");
            expect(normalizeEmail("  ")).toBeNull();
        });
    });
    describe("normalizePhone", () => {
        it("should collapse spaces while preserving + country code and digits", () => {
            expect(normalizePhone("  +91  98765  43210  ")).toBe("+91 98765 43210");
            expect(normalizePhone("+1-555-0192")).toBe("+1-555-0192");
        });
    });
    describe("normalizeUrl", () => {
        it("should trim URL without inventing missing protocols", () => {
            expect(normalizeUrl("  https://github.com/user  ")).toBe("https://github.com/user");
            expect(normalizeUrl("github.com/user")).toBe("github.com/user");
        });
    });
    describe("normalizeSkillName & normalizeSkillLookupKey", () => {
        it("should canonicalize technology aliases via exact lookup keys", () => {
            expect(normalizeSkillName("ReactJS")).toBe("React");
            expect(normalizeSkillName("react.js")).toBe("React");
            expect(normalizeSkillName("REACT JS")).toBe("React");
            expect(normalizeSkillName("NodeJS")).toBe("Node.js");
            expect(normalizeSkillName("node.js")).toBe("Node.js");
            expect(normalizeSkillName("Postgres")).toBe("PostgreSQL");
            expect(normalizeSkillName("K8s")).toBe("Kubernetes");
            expect(normalizeSkillName("TS")).toBe("TypeScript");
            expect(normalizeSkillName("TailwindCSS")).toBe("Tailwind CSS");
        });
        it("should NOT collision-alias compound skill names (Non-destructive check)", () => {
            expect(normalizeSkillName("React Native")).toBe("React Native");
            expect(normalizeSkillName("React Query")).toBe("React Query");
            expect(normalizeSkillName("React Testing Library")).toBe("React Testing Library");
            expect(normalizeSkillName("Node-RED")).toBe("Node-RED");
            expect(normalizeSkillName("C++")).toBe("C++");
            expect(normalizeSkillName("C#")).toBe("C#");
        });
        it("should generate stable lookup keys ignoring punctuation and spaces", () => {
            expect(normalizeSkillLookupKey("React.JS")).toBe("reactjs");
            expect(normalizeSkillLookupKey(" React JS ")).toBe("reactjs");
            expect(normalizeSkillLookupKey("React-JS")).toBe("reactjs");
        });
    });
    describe("normalizeDateString", () => {
        it("should normalize variants of 'Present' consistently", () => {
            expect(normalizeDateString("present")).toBe("Present");
            expect(normalizeDateString("CURRENT")).toBe("Present");
            expect(normalizeDateString(" ongoing ")).toBe("Present");
        });
        it("should normalize month capitalization without inventing missing dates", () => {
            expect(normalizeDateString("jan 2022")).toBe("Jan 2022");
            expect(normalizeDateString("FEBRUARY 2020")).toBe("February 2020");
            expect(normalizeDateString("2024")).toBe("2024");
        });
    });
    describe("normalizeEmploymentType", () => {
        it("should map text variants to canonical EmploymentType enum values", () => {
            expect(normalizeEmploymentType("full time")).toBe(EmploymentType.FULL_TIME);
            expect(normalizeEmploymentType("Full-Time")).toBe(EmploymentType.FULL_TIME);
            expect(normalizeEmploymentType("contractor")).toBe(EmploymentType.CONTRACT);
            expect(normalizeEmploymentType("internship")).toBe(EmploymentType.INTERN);
            expect(normalizeEmploymentType(EmploymentType.FREELANCE)).toBe(EmploymentType.FREELANCE);
            expect(normalizeEmploymentType("unknown_type")).toBeNull();
        });
    });
    describe("normalizeLookupKey for deduplication", () => {
        it("should strip trailing punctuation and case for deduplication matching", () => {
            expect(normalizeLookupKey("AWS Certified Developer.")).toBe("aws certified developer");
            expect(normalizeLookupKey("AWS Certified Developer")).toBe("aws certified developer");
        });
    });
});
//# sourceMappingURL=resume-normalization.utils.test.js.map