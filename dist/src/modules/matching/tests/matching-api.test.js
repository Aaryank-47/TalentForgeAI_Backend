import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { MatchingService } from "../services/matching.service.js";
import { MatchingRepository } from "../repositories/matching.repository.js";
import { AuthRepository } from "../../auth/repositories/auth.repository.js";
import { CompanyRepository } from "../../company/repository/company.repository.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ForbiddenError } from "../../../common/errors/ForbiddenError.js";
describe("Matching API & Service Integration Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe("Candidate Matched Jobs API", () => {
        it("should retrieve matched jobs for authenticated candidate", async () => {
            jest.spyOn(AuthRepository, "findProfileByUserId").mockResolvedValue({
                id: "user_cand_1",
                email: "cand@test.com",
                role: "CANDIDATE",
                profile: {
                    id: "cand_record_1",
                    isOpenToWork: true
                }
            });
            const mockMatches = [
                {
                    id: "match_1",
                    jobId: "job_1",
                    matchScore: 92,
                    deterministicScore: 90,
                    semanticScore: 95,
                    matchingFactors: { skills: { score: 38 } },
                    status: "CURRENT",
                    calculatedAt: new Date().toISOString(),
                    job: {
                        id: "job_1",
                        title: "Full Stack Engineer",
                        slug: "full-stack-engineer-acme",
                        summary: "React / Node position",
                        employmentType: "FULL_TIME",
                        workplaceType: "REMOTE",
                        location: null,
                        minExperience: 3,
                        maxExperience: 6,
                        minimumSalary: 120000,
                        maximumSalary: 160000,
                        salaryPeriod: "YEARLY",
                        publishedAt: new Date().toISOString(),
                        company: {
                            id: "comp_1",
                            companyName: "Acme Corp",
                            logo: null,
                            industry: "Technology",
                            isVerified: true
                        },
                        skills: [
                            { id: "sk_1", name: "React", isRequired: true },
                            { id: "sk_2", name: "Node.js", isRequired: true }
                        ]
                    }
                }
            ];
            jest.spyOn(MatchingRepository, "findMatchesForCandidate").mockResolvedValue({
                matches: mockMatches,
                total: 1
            });
            const result = await MatchingService.getMatchedJobsForCandidate("user_cand_1", {
                page: 1,
                limit: 10
            });
            expect(result.total).toBe(1);
            expect(result.matches).toHaveLength(1);
            expect(result.matches[0]?.matchScore).toBe(92);
            expect(result.matches[0]?.job.title).toBe("Full Stack Engineer");
        });
        it("should throw NotFoundError if candidate profile does not exist", async () => {
            jest.spyOn(AuthRepository, "findProfileByUserId").mockResolvedValue(null);
            await expect(MatchingService.getMatchedJobsForCandidate("non_existent_user")).rejects.toThrow(NotFoundError);
        });
    });
    describe("Recruiter Matched Candidates API", () => {
        it("should retrieve matched candidates for recruiter with authorized company membership", async () => {
            jest.spyOn(MatchingRepository, "getJobMatchingRequirements").mockResolvedValue({
                id: "job_1",
                companyId: "comp_1",
                title: "Backend Engineer",
                summary: "Node.js position",
                description: "Backend engineer with Node.js",
                employmentType: "FULL_TIME",
                workplaceType: "REMOTE",
                location: null,
                minExperience: 3,
                maxExperience: 6,
                status: "PUBLISHED",
                requirementsVersion: 1,
                skills: [{ name: "Node.js", isRequired: true }],
                updatedAt: new Date()
            });
            jest.spyOn(CompanyRepository, "findMemberByUserAndCompany").mockResolvedValue({
                id: "mem_1",
                userId: "recruiter_1",
                companyId: "comp_1",
                role: "RECRUITER",
                status: "ACTIVE"
            });
            const mockCandidates = [
                {
                    id: "match_1",
                    candidateId: "cand_1",
                    matchScore: 88,
                    deterministicScore: 88,
                    semanticScore: null,
                    matchingFactors: { skills: { score: 35 } },
                    status: "CURRENT",
                    calculatedAt: new Date().toISOString(),
                    candidate: {
                        id: "cand_1",
                        fullName: "John Doe",
                        headline: "Node.js Developer",
                        profilePicture: null,
                        currentDesignation: "Software Engineer",
                        currentCompany: "Tech Inc",
                        totalExperience: 4.0,
                        experienceLevel: "MID_LEVEL",
                        currentLocation: "New York, NY",
                        preferredLocation: "New York, NY",
                        isOpenToWork: true,
                        skills: [{ id: "s1", name: "Node.js", yearsOfExperience: 4 }],
                        educations: [{ id: "e1", collegeName: "MIT", degree: "B.S.", fieldOfStudy: "CS" }],
                        experiences: []
                    }
                }
            ];
            jest.spyOn(MatchingRepository, "findMatchesForJob").mockResolvedValue({
                matches: mockCandidates,
                total: 1
            });
            const result = await MatchingService.getMatchedCandidatesForJob("job_1", "recruiter_1", "comp_1");
            expect(result.total).toBe(1);
            expect(result.matches[0]?.matchScore).toBe(88);
            expect(result.matches[0]?.candidate.fullName).toBe("John Doe");
        });
        it("should reject unauthorized recruiter accessing another company's job", async () => {
            jest.spyOn(MatchingRepository, "getJobMatchingRequirements").mockResolvedValue({
                id: "job_1",
                companyId: "comp_1",
                title: "Backend Engineer",
                summary: null,
                description: "...",
                employmentType: "FULL_TIME",
                workplaceType: "REMOTE",
                location: null,
                minExperience: 3,
                maxExperience: 6,
                status: "PUBLISHED",
                requirementsVersion: 1,
                skills: [],
                updatedAt: new Date()
            });
            // Recruiter does not belong to comp_1
            jest.spyOn(CompanyRepository, "findMemberByUserAndCompany").mockResolvedValue(null);
            await expect(MatchingService.getMatchedCandidatesForJob("job_1", "unauthorized_user", "comp_1")).rejects.toThrow(ForbiddenError);
        });
    });
});
//# sourceMappingURL=matching-api.test.js.map