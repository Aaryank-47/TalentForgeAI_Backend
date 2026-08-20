import { describe, expect, it, jest } from "@jest/globals";
import { ApiError } from "../../../common/errors/ApiError.js";
import { ResumePersistenceService } from "../services/resume-persistence.service.js";
describe("ResumePersistenceService", () => {
    const data = {
        personal: {
            fullName: "Jane Doe",
            email: "jane@example.com",
            phoneNumber: null,
            currentLocation: null,
            linkedinUrl: null,
            githubUrl: null,
            portfolioUrl: null,
            websiteUrl: null
        },
        professional: {
            headline: "Engineer",
            bio: null,
            currentCompany: null,
            currentDesignation: null,
            totalExperience: null
        },
        skills: [{ name: "React", yearsOfExperience: 4 }],
        experience: [],
        education: [],
        projects: [{ name: "TalentForge", description: "Hiring platform" }],
        certifications: [{ name: "AWS Certified Developer" }]
    };
    it("delegates normalized data and returns the persistence result", async () => {
        const result = {
            candidateId: "candidate-1",
            skillsCreated: 1,
            skillsUpdated: 0,
            experiencesCreated: 0,
            experiencesUpdated: 0,
            educationCreated: 0,
            educationUpdated: 0,
            projectsCreated: 1,
            projectsUpdated: 0,
            certificationsCreated: 1,
            certificationsUpdated: 0
        };
        const persist = jest.fn().mockResolvedValue(result);
        const service = new ResumePersistenceService({ persist });
        await expect(service.persistResumeData("candidate-1", data)).resolves.toEqual(result);
        expect(persist).toHaveBeenCalledWith("candidate-1", data);
    });
    it("wraps persistence failures without exposing parsed resume data", async () => {
        const persist = jest.fn().mockRejectedValue(new Error("database unavailable"));
        const service = new ResumePersistenceService({ persist });
        await expect(service.persistResumeData("candidate-1", data)).rejects.toThrow("Failed to persist resume data");
        await expect(service.persistResumeData("candidate-1", data)).rejects.not.toThrow("jane@example.com");
    });
    it("preserves existing application errors", async () => {
        const notFound = new ApiError(404, "Candidate not found");
        const persist = jest.fn().mockRejectedValue(notFound);
        const service = new ResumePersistenceService({ persist });
        await expect(service.persistResumeData("candidate-1", data)).rejects.toBe(notFound);
    });
    it("rejects a blank candidate ID before touching the repository", async () => {
        const persist = jest.fn();
        const service = new ResumePersistenceService({ persist });
        await expect(service.persistResumeData("   ", data)).rejects.toThrow("Candidate ID is required");
        expect(persist).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=resume-persistence.service.test.js.map