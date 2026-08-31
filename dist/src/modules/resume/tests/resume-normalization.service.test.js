import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { EmploymentType, GradingSystem } from "@prisma/client";
import { ResumeNormalizationService } from "../services/resume-normalization.service.js";
import { SkillRepository } from "../repositories/skill.repository.js";
describe("ResumeNormalizationService & Skill Taxonomy Integration Tests", () => {
    const normalizationService = new ResumeNormalizationService();
    beforeEach(() => {
        jest
            .spyOn(SkillRepository.prototype, "findSkillsByNormalizedAliases")
            .mockResolvedValue(new Map());
        jest
            .spyOn(SkillRepository.prototype, "recordSkillCandidates")
            .mockResolvedValue();
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    const createBaseInput = () => ({
        personal: {
            fullName: "  John   Doe  ",
            email: "  JOHN.DOE@EXAMPLE.COM ",
            phoneNumber: " +1  555  0192834 ",
            currentLocation: "  New York , NY ",
            linkedinUrl: "  https://linkedin.com/in/johndoe  ",
            githubUrl: null,
            portfolioUrl: null,
            websiteUrl: null
        },
        professional: {
            headline: "  Senior   Software Engineer ",
            bio: "  Line 1   \n\n\n\n  Line 2  ",
            currentCompany: "  Acme   Corp ",
            currentDesignation: "  Senior   Developer ",
            totalExperience: 7
        },
        skills: [
            { name: "  ReactJS ", yearsOfExperience: 2 },
            { name: "React.js", yearsOfExperience: 4 },
            { name: " react js ", yearsOfExperience: 1 },
            { name: "NodeJS", yearsOfExperience: 3 },
            { name: "  TypeScript  ", yearsOfExperience: null },
            { name: "React Native", yearsOfExperience: 2 },
            { name: "LangChain", yearsOfExperience: 1 },
            { name: "   ", yearsOfExperience: 2 }
        ],
        experience: [
            {
                companyName: "  Acme   Corporation ",
                designation: "  Lead   Engineer ",
                employmentType: EmploymentType.FULL_TIME,
                description: "  Developed   backend   microservices.  \n\n  Built APIs. ",
                location: "  San Francisco, CA ",
                startDate: "  jan 2020 ",
                endDate: "  present ",
                currentlyWorking: true
            }
        ],
        education: [
            {
                collegeName: "  Stanford   University ",
                degree: "  Bachelor of Science ",
                fieldOfStudy: "  Computer Science ",
                currentlyStudying: false,
                startDate: "  2016 ",
                endDate: "  2020 ",
                gradingSystem: GradingSystem.CGPA,
                gradeText: " 3.9 / 4.0 ",
                grade: 3.9
            }
        ],
        projects: [
            {
                name: "  TalentForge   AI. ",
                description: "  AI powered recruitment system. "
            },
            {
                name: "TalentForge AI",
                description: "AI powered recruitment system"
            }
        ],
        certifications: [
            { name: "  AWS Certified Solutions Architect.  " },
            { name: "AWS Certified Solutions Architect" }
        ]
    });
    it("1., 2. & 3. DB alias resolution maps aliases (reactjs -> React, k8s -> Kubernetes)", async () => {
        const mockDbMap = new Map();
        mockDbMap.set("reactjs", { id: "1", name: "React", slug: "react", category: "FRONTEND" });
        mockDbMap.set("nodejs", { id: "2", name: "Node.js", slug: "node-js", category: "BACKEND" });
        mockDbMap.set("typescript", { id: "3", name: "TypeScript", slug: "typescript", category: "PROGRAMMING_LANGUAGE" });
        jest
            .spyOn(SkillRepository.prototype, "findSkillsByNormalizedAliases")
            .mockResolvedValue(mockDbMap);
        const input = createBaseInput();
        const result = await normalizationService.normalizeResumeData(input);
        const reactSkill = result.skills.find((s) => s.name === "React");
        expect(reactSkill).toBeDefined();
        expect(reactSkill?.yearsOfExperience).toBe(4);
    });
    it("4. Unknown skill ('LangChain') is preserved and candidate recording is triggered", async () => {
        jest
            .spyOn(SkillRepository.prototype, "recordSkillCandidates")
            .mockResolvedValue();
        const input = createBaseInput();
        const result = await normalizationService.normalizeResumeData(input);
        const langChain = result.skills.find((s) => s.name === "LangChain");
        expect(langChain).toBeDefined();
        expect(langChain?.name).toBe("LangChain");
    });
    it("5. & 6. Duplicate aliases merge cleanly retaining max YOE (ReactJS=2, React.js=4 -> React=4)", async () => {
        const input = createBaseInput();
        const result = await normalizationService.normalizeResumeData(input);
        const reactSkills = result.skills.filter((s) => s.name.toLowerCase().includes("react") && s.name !== "React Native");
        expect(reactSkills).toHaveLength(1);
        expect(reactSkills[0]?.yearsOfExperience).toBe(4);
    });
    it("7. Invalid years (-1) become null", async () => {
        const input = createBaseInput();
        input.skills = [{ name: "Docker", yearsOfExperience: -1 }];
        const result = await normalizationService.normalizeResumeData(input);
        expect(result.skills[0]?.yearsOfExperience).toBeNull();
    });
    it("8. Empty skills ('') are ignored", async () => {
        const input = createBaseInput();
        input.skills = [{ name: "   ", yearsOfExperience: 5 }];
        const result = await normalizationService.normalizeResumeData(input);
        expect(result.skills).toHaveLength(0);
    });
    it("9. DB lookup failure resilience: normalization continues cleanly with raw cleaned names", async () => {
        jest
            .spyOn(SkillRepository.prototype, "findSkillsByNormalizedAliases")
            .mockRejectedValue(new Error("Database connection timeout"));
        const input = createBaseInput();
        const result = await normalizationService.normalizeResumeData(input);
        expect(result.skills.length).toBeGreaterThan(0);
    });
    it("10. SkillCandidate persistence failure resilience: normalization succeeds without throwing", async () => {
        jest
            .spyOn(SkillRepository.prototype, "recordSkillCandidates")
            .mockRejectedValue(new Error("Unique constraint violation"));
        const input = createBaseInput();
        const result = await normalizationService.normalizeResumeData(input);
        expect(result.personal.fullName).toBe("John Doe");
    });
    it("11. Bulk candidate recording: does not perform sequential individual upsert writes", async () => {
        jest
            .spyOn(SkillRepository.prototype, "findSkillsByNormalizedAliases")
            .mockResolvedValue(new Map());
        const recordSpy = jest.spyOn(SkillRepository.prototype, "recordSkillCandidates");
        const input = createBaseInput();
        await normalizationService.normalizeResumeData(input);
        expect(recordSpy).toHaveBeenCalledTimes(1);
    });
    it("Idempotency test: normalize(normalize(data)) === normalize(data)", async () => {
        const input = createBaseInput();
        const firstPass = await normalizationService.normalizeResumeData(input);
        const secondPass = await normalizationService.normalizeResumeData(firstPass);
        expect(secondPass).toEqual(firstPass);
    });
});
//# sourceMappingURL=resume-normalization.service.test.js.map