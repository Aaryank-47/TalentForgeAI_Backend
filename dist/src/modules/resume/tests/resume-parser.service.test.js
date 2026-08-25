import { describe, expect, it, jest } from "@jest/globals";
import { EmploymentType, GradingSystem } from "@prisma/client";
import { OpenRouterClient } from "../../../common/integrations/openRouter/openrouter.client.js";
import { ResumeParserService } from "../services/resume-parser.service.js";
describe("ResumeParserService Tests", () => {
    const resumeParserService = new ResumeParserService();
    const mockValidJsonResponse = JSON.stringify({
        personal: {
            fullName: "Alex Smith",
            email: "alex.smith@example.com",
            phoneNumber: "+15550192834",
            currentLocation: "New York, NY",
            linkedinUrl: "https://linkedin.com/in/alexsmith",
            githubUrl: "https://github.com/alexsmith",
            portfolioUrl: null,
            websiteUrl: null
        },
        professional: {
            headline: "Senior Software Engineer",
            bio: "Passionate developer with 7 years of backend engineering experience.",
            currentCompany: "Acme Corp",
            currentDesignation: "Staff Backend Engineer",
            totalExperience: 7
        },
        skills: [
            {
                name: "Node.js",
                yearsOfExperience: 5
            },
            {
                name: "PostgreSQL",
                yearsOfExperience: 4
            }
        ],
        experience: [
            {
                companyName: "Acme Corp",
                designation: "Staff Backend Engineer",
                employmentType: EmploymentType.FULL_TIME,
                description: "Architected microservices using Node.js.",
                location: "New York, NY",
                startDate: "2020-01",
                endDate: null,
                currentlyWorking: true
            }
        ],
        education: [
            {
                collegeName: "MIT",
                degree: "Bachelor of Science",
                fieldOfStudy: "Computer Science",
                currentlyStudying: false,
                startDate: "2013",
                endDate: "2017",
                gradingSystem: GradingSystem.GPA_4,
                gradeText: "3.9 GPA",
                grade: 3.9
            }
        ],
        projects: [
            {
                name: "Open Source Database Library",
                description: "High performance ORM extensions."
            }
        ],
        certifications: [
            {
                name: "AWS Certified Developer"
            }
        ]
    });
    it("should throw error if input resume text is empty", async () => {
        await expect(resumeParserService.parseResumeText("   ")).rejects.toThrow("Resume content cannot be empty for parsing");
    });
    it("should parse resume text and return validated ResumeParsingResult when OpenRouter returns valid JSON", async () => {
        const generateTextSpy = jest
            .spyOn(OpenRouterClient, "generateText")
            .mockResolvedValue(mockValidJsonResponse);
        const sampleText = "Alex Smith\nSenior Software Engineer\nalex.smith@example.com";
        const result = await resumeParserService.parseResumeText(sampleText);
        expect(generateTextSpy).toHaveBeenCalledTimes(1);
        expect(result.personal.fullName).toBe("Alex Smith");
        expect(result.personal.email).toBe("alex.smith@example.com");
        expect(result.professional.headline).toBe("Senior Software Engineer");
        expect(result.skills).toHaveLength(2);
        expect(result.experience).toHaveLength(1);
        expect(result.education).toHaveLength(1);
        generateTextSpy.mockRestore();
    });
    it("should parse correctly when OpenRouter response is wrapped in markdown ```json ``` code block", async () => {
        const markdownWrapped = `\`\`\`json\n${mockValidJsonResponse}\n\`\`\``;
        const generateTextSpy = jest
            .spyOn(OpenRouterClient, "generateText")
            .mockResolvedValue(markdownWrapped);
        const sampleText = "Alex Smith Resume";
        const result = await resumeParserService.parseResumeText(sampleText);
        expect(result.personal.fullName).toBe("Alex Smith");
        generateTextSpy.mockRestore();
    });
    it("should parse correctly when OpenRouter response contains explanatory text around JSON", async () => {
        const textSurrounded = `Here is the extracted resume information:\n\n${mockValidJsonResponse}\n\nHope this helps!`;
        const generateTextSpy = jest
            .spyOn(OpenRouterClient, "generateText")
            .mockResolvedValue(textSurrounded);
        const sampleText = "Alex Smith Resume";
        const result = await resumeParserService.parseResumeText(sampleText);
        expect(result.personal.fullName).toBe("Alex Smith");
        generateTextSpy.mockRestore();
    });
    it("should throw error if OpenRouter returns non-JSON text", async () => {
        const generateTextSpy = jest
            .spyOn(OpenRouterClient, "generateText")
            .mockResolvedValue("This is plain text and not valid JSON");
        await expect(resumeParserService.parseResumeText("Some Resume Text")).rejects.toThrow("Failed to parse AI response as JSON");
        generateTextSpy.mockRestore();
    });
    it("should throw error if OpenRouter returns JSON that fails Zod schema validation", async () => {
        const invalidSchemaJson = JSON.stringify({
            personal: {
                fullName: 12345 // invalid type
            }
        });
        const generateTextSpy = jest
            .spyOn(OpenRouterClient, "generateText")
            .mockResolvedValue(invalidSchemaJson);
        await expect(resumeParserService.parseResumeText("Some Resume Text")).rejects.toThrow("AI resume parsing response failed validation");
        generateTextSpy.mockRestore();
    });
    it("should propagate OpenRouter API client errors", async () => {
        const generateTextSpy = jest
            .spyOn(OpenRouterClient, "generateText")
            .mockRejectedValue(new Error("OpenRouter Error: 500 - Server Error"));
        await expect(resumeParserService.parseResumeText("Some Resume Text")).rejects.toThrow("OpenRouter Error: 500 - Server Error");
        generateTextSpy.mockRestore();
    });
    it("should handle valid resume containing missing scalar fields as null and empty collections as []", async () => {
        const mockMinimalJson = JSON.stringify({
            personal: {
                fullName: "Jane Doe",
                email: null,
                phoneNumber: null,
                currentLocation: null,
                linkedinUrl: null,
                githubUrl: null,
                portfolioUrl: null,
                websiteUrl: null
            },
            professional: {
                headline: null,
                bio: null,
                currentCompany: null,
                currentDesignation: null,
                totalExperience: null
            },
            skills: [],
            experience: [],
            education: [],
            projects: [],
            certifications: []
        });
        const generateTextSpy = jest
            .spyOn(OpenRouterClient, "generateText")
            .mockResolvedValue(mockMinimalJson);
        const result = await resumeParserService.parseResumeText("Jane Doe Minimal Resume");
        expect(result.personal.fullName).toBe("Jane Doe");
        expect(result.personal.email).toBeNull();
        expect(result.skills).toEqual([]);
        expect(result.experience).toEqual([]);
        expect(result.education).toEqual([]);
        generateTextSpy.mockRestore();
    });
    it("should parse resume document buffer directly when valid PDF buffer is provided with leading/trailing spaces in mimeType", async () => {
        const generateDocSpy = jest
            .spyOn(OpenRouterClient, "generateFromDocument")
            .mockResolvedValue(mockValidJsonResponse);
        const dummyPdfBuffer = Buffer.from("%PDF-1.4 Dummy PDF Content");
        const result = await resumeParserService.parseResumeDocument(dummyPdfBuffer, " APPLICATION/PDF ");
        expect(generateDocSpy).toHaveBeenCalledTimes(1);
        expect(result.personal.fullName).toBe("Alex Smith");
        generateDocSpy.mockRestore();
    });
    it("should throw error if parseResumeDocument receives an empty document buffer", async () => {
        const emptyBuffer = Buffer.from("");
        await expect(resumeParserService.parseResumeDocument(emptyBuffer, "application/pdf")).rejects.toThrow("Resume document buffer cannot be empty");
    });
    it("should safely sanitize placeholders ('N/A', 'Not specified', '') into null", async () => {
        const jsonWithPlaceholders = JSON.stringify({
            personal: {
                fullName: "Jordan Lee",
                email: "jordan@example.com",
                phoneNumber: "N/A",
                currentLocation: "Not specified",
                linkedinUrl: "",
                githubUrl: "none",
                portfolioUrl: "null",
                websiteUrl: "undefined"
            },
            professional: {
                headline: "Software Engineer",
                bio: "N/A",
                currentCompany: "Unknown",
                currentDesignation: "",
                totalExperience: "3"
            },
            skills: [
                { name: "C", yearsOfExperience: "2" },
                { name: "R", yearsOfExperience: "N/A" }
            ],
            experience: [],
            education: [
                {
                    collegeName: "City High School",
                    degree: "Secondary School",
                    fieldOfStudy: "N/A",
                    currentlyStudying: false,
                    startDate: "2018",
                    endDate: "2020",
                    gradingSystem: "N/A",
                    gradeText: "N/A",
                    grade: "N/A"
                }
            ],
            projects: [],
            certifications: []
        });
        const generateTextSpy = jest
            .spyOn(OpenRouterClient, "generateText")
            .mockResolvedValue(jsonWithPlaceholders);
        const result = await resumeParserService.parseResumeText("Jordan Lee Resume");
        expect(result.personal.phoneNumber).toBeNull();
        expect(result.personal.currentLocation).toBeNull();
        expect(result.personal.linkedinUrl).toBeNull();
        expect(result.personal.githubUrl).toBeNull();
        expect(result.professional.totalExperience).toBe(3);
        expect(result.skills[0].name).toBe("C");
        expect(result.skills[0].yearsOfExperience).toBe(2);
        expect(result.skills[1].name).toBe("R");
        expect(result.skills[1].yearsOfExperience).toBeNull();
        expect(result.education[0].fieldOfStudy).toBeNull();
        generateTextSpy.mockRestore();
    });
    it("should safely recover and filter out an isolated unusable array item without failing the entire resume", async () => {
        const jsonWithMalformedItem = JSON.stringify({
            personal: {
                fullName: "Taylor Reed",
                email: "taylor@example.com",
                phoneNumber: null,
                currentLocation: null,
                linkedinUrl: null,
                githubUrl: null,
                portfolioUrl: null,
                websiteUrl: null
            },
            professional: {
                headline: null,
                bio: null,
                currentCompany: null,
                currentDesignation: null,
                totalExperience: null
            },
            skills: [
                { name: "TypeScript", yearsOfExperience: 4 },
                null, // Malformed null item
                { name: "", yearsOfExperience: null }, // Empty skill name
                { name: "Python", yearsOfExperience: 3 }
            ],
            experience: [
                {
                    companyName: "Valid Corp",
                    designation: "Developer",
                    employmentType: null,
                    description: null,
                    location: null,
                    startDate: null,
                    endDate: null,
                    currentlyWorking: true
                },
                {
                    // Missing required companyName & designation
                    description: "Malformed experience entry"
                }
            ],
            education: [],
            projects: [],
            certifications: []
        });
        const generateTextSpy = jest
            .spyOn(OpenRouterClient, "generateText")
            .mockResolvedValue(jsonWithMalformedItem);
        const result = await resumeParserService.parseResumeText("Taylor Reed Resume");
        // Valid skills preserved, malformed ones skipped
        expect(result.skills).toHaveLength(2);
        expect(result.skills[0].name).toBe("TypeScript");
        expect(result.skills[1].name).toBe("Python");
        // Valid experience preserved, malformed skipped
        expect(result.experience).toHaveLength(1);
        expect(result.experience[0].companyName).toBe("Valid Corp");
        generateTextSpy.mockRestore();
    });
    it("should fail when root response is not a JSON object", async () => {
        const invalidRootJson = JSON.stringify(["Array at root instead of object"]);
        const generateTextSpy = jest
            .spyOn(OpenRouterClient, "generateText")
            .mockResolvedValue(invalidRootJson);
        await expect(resumeParserService.parseResumeText("Some text")).rejects.toThrow("Root response must be a JSON object");
        generateTextSpy.mockRestore();
    });
});
//# sourceMappingURL=resume-parser.service.test.js.map