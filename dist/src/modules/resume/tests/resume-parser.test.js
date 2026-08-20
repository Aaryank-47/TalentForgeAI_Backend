import { describe, expect, it } from "@jest/globals";
import { EmploymentType, GradingSystem } from "@prisma/client";
import { resumeParsingSchema } from "../dto/resume-parser.dto.js";
describe("Resume Parsing Schema Contract Tests", () => {
    const validFullPayload = {
        personal: {
            fullName: "Jane Doe",
            email: "jane.doe@example.com",
            phoneNumber: "+1234567890",
            currentLocation: "San Francisco, CA",
            linkedinUrl: "https://www.linkedin.com/in/janedoe",
            githubUrl: "https://github.com/janedoe",
            portfolioUrl: "https://janedoe.dev",
            websiteUrl: "https://janedoe.com"
        },
        professional: {
            headline: "Senior Full Stack Engineer",
            bio: "Experienced developer specializing in Node.js and TypeScript.",
            currentCompany: "Tech Corp",
            currentDesignation: "Lead Software Engineer",
            totalExperience: 6.5
        },
        skills: [
            {
                name: "TypeScript",
                yearsOfExperience: 5
            },
            {
                name: "Node.js",
                yearsOfExperience: null
            }
        ],
        experience: [
            {
                companyName: "Tech Corp",
                designation: "Lead Software Engineer",
                employmentType: EmploymentType.FULL_TIME,
                description: "Built scalable backend services.",
                location: "Remote",
                startDate: "2021-06",
                endDate: null,
                currentlyWorking: true
            }
        ],
        education: [
            {
                collegeName: "Stanford University",
                degree: "Bachelor of Science",
                fieldOfStudy: "Computer Science",
                currentlyStudying: false,
                startDate: "2015",
                endDate: "2019",
                gradingSystem: GradingSystem.GPA_4,
                gradeText: "3.8 GPA",
                grade: 3.8
            }
        ],
        projects: [
            {
                name: "TalentForge AI",
                description: "AI-driven candidate matching platform."
            }
        ],
        certifications: [
            {
                name: "AWS Certified Solutions Architect"
            }
        ]
    };
    describe("VALID Payloads", () => {
        it("should accept a complete valid parsing response", () => {
            const result = resumeParsingSchema.safeParse(validFullPayload);
            expect(result.success).toBe(true);
        });
        it("should accept missing scalar data represented by null", () => {
            const payloadWithNulls = {
                ...validFullPayload,
                personal: {
                    fullName: null,
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
                }
            };
            const result = resumeParsingSchema.safeParse(payloadWithNulls);
            expect(result.success).toBe(true);
        });
        it("should accept empty arrays for skills, experience, education, projects, certifications", () => {
            const payloadWithEmptyArrays = {
                ...validFullPayload,
                skills: [],
                experience: [],
                education: [],
                projects: [],
                certifications: []
            };
            const result = resumeParsingSchema.safeParse(payloadWithEmptyArrays);
            expect(result.success).toBe(true);
        });
        it("should validate all valid EmploymentType enum values", () => {
            Object.values(EmploymentType).forEach((empType) => {
                const payload = {
                    ...validFullPayload,
                    experience: [
                        {
                            ...validFullPayload.experience[0],
                            employmentType: empType
                        }
                    ]
                };
                const result = resumeParsingSchema.safeParse(payload);
                expect(result.success).toBe(true);
            });
        });
        it("should validate all valid GradingSystem enum values", () => {
            Object.values(GradingSystem).forEach((gradingSys) => {
                const payload = {
                    ...validFullPayload,
                    education: [
                        {
                            ...validFullPayload.education[0],
                            gradingSystem: gradingSys
                        }
                    ]
                };
                const result = resumeParsingSchema.safeParse(payload);
                expect(result.success).toBe(true);
            });
        });
        it("should validate proper URL formats", () => {
            const payload = {
                ...validFullPayload,
                personal: {
                    ...validFullPayload.personal,
                    linkedinUrl: "https://linkedin.com/in/user",
                    githubUrl: "https://github.com/user"
                }
            };
            const result = resumeParsingSchema.safeParse(payload);
            expect(result.success).toBe(true);
        });
    });
    describe("INVALID Payloads", () => {
        it("should fail when fullName is wrong type (number)", () => {
            const payload = {
                ...validFullPayload,
                personal: {
                    ...validFullPayload.personal,
                    fullName: 12345
                }
            };
            const result = resumeParsingSchema.safeParse(payload);
            expect(result.success).toBe(false);
        });
        it("should fail when totalExperience is wrong type (string)", () => {
            const payload = {
                ...validFullPayload,
                professional: {
                    ...validFullPayload.professional,
                    totalExperience: "five years"
                }
            };
            const result = resumeParsingSchema.safeParse(payload);
            expect(result.success).toBe(false);
        });
        it("should fail when yearsOfExperience in skills is negative", () => {
            const payload = {
                ...validFullPayload,
                skills: [
                    {
                        name: "Java",
                        yearsOfExperience: -2
                    }
                ]
            };
            const result = resumeParsingSchema.safeParse(payload);
            expect(result.success).toBe(false);
        });
        it("should fail when employmentType is invalid", () => {
            const payload = {
                ...validFullPayload,
                experience: [
                    {
                        ...validFullPayload.experience[0],
                        employmentType: "SUPER_FULL_TIME"
                    }
                ]
            };
            const result = resumeParsingSchema.safeParse(payload);
            expect(result.success).toBe(false);
        });
        it("should fail when gradingSystem is invalid", () => {
            const payload = {
                ...validFullPayload,
                education: [
                    {
                        ...validFullPayload.education[0],
                        gradingSystem: "SUPER_GPA"
                    }
                ]
            };
            const result = resumeParsingSchema.safeParse(payload);
            expect(result.success).toBe(false);
        });
        it("should fail when URL is invalid string", () => {
            const payload = {
                ...validFullPayload,
                personal: {
                    ...validFullPayload.personal,
                    linkedinUrl: "not-a-valid-url"
                }
            };
            const result = resumeParsingSchema.safeParse(payload);
            expect(result.success).toBe(false);
        });
        it("should fail when skills is null", () => {
            const payload = {
                ...validFullPayload,
                skills: null
            };
            const result = resumeParsingSchema.safeParse(payload);
            expect(result.success).toBe(false);
        });
        it("should fail when skills is a string", () => {
            const payload = {
                ...validFullPayload,
                skills: "Node.js, React"
            };
            const result = resumeParsingSchema.safeParse(payload);
            expect(result.success).toBe(false);
        });
        it("should fail when experience is null", () => {
            const payload = {
                ...validFullPayload,
                experience: null
            };
            const result = resumeParsingSchema.safeParse(payload);
            expect(result.success).toBe(false);
        });
        it("should fail when missing a required top-level collection", () => {
            const { skills, ...payloadWithoutSkills } = validFullPayload;
            const result = resumeParsingSchema.safeParse(payloadWithoutSkills);
            expect(result.success).toBe(false);
        });
        it("should fail when nested object structure is invalid (missing required currentlyWorking)", () => {
            const payload = {
                ...validFullPayload,
                experience: [
                    {
                        companyName: "Tech Corp",
                        designation: "Engineer",
                        employmentType: null,
                        description: null,
                        location: null,
                        startDate: null,
                        endDate: null
                        // missing currentlyWorking
                    }
                ]
            };
            const result = resumeParsingSchema.safeParse(payload);
            expect(result.success).toBe(false);
        });
    });
});
//# sourceMappingURL=resume-parser.test.js.map