import { describe, expect, it, jest } from "@jest/globals";
import { MatchingScorerService } from "../services/matching-scorer.service.js";
import { OpenRouterClient } from "../../../common/integrations/openRouter/openrouter.client.js";
describe("MatchingScorerService Unit Tests", () => {
    const mockCandidate = {
        id: "cand_1",
        userId: "user_cand_1",
        fullName: "Alex Rivera",
        headline: "Senior Full Stack Engineer (React, Node.js, TypeScript)",
        currentDesignation: "Senior Software Engineer",
        totalExperience: 5.0,
        experienceLevel: "SENIOR",
        currentLocation: "San Francisco, CA",
        preferredLocation: "San Francisco, CA",
        isOpenToWork: true,
        profileVersion: 1,
        skills: [
            { name: "React", yearsOfExperience: 5 },
            { name: "TypeScript", yearsOfExperience: 4 },
            { name: "Node.js", yearsOfExperience: 4 },
            { name: "PostgreSQL", yearsOfExperience: 3 },
            { name: "Docker", yearsOfExperience: 2 }
        ],
        educationDegrees: ["Bachelor of Science in Computer Science"],
        certificationNames: ["AWS Certified Developer"],
        updatedAt: new Date()
    };
    const mockJob = {
        id: "job_1",
        companyId: "comp_1",
        title: "Senior Full Stack Engineer",
        summary: "Looking for a seasoned Full Stack Engineer with strong React and Node.js skills.",
        description: "We build high scale platforms using React, TypeScript, Node.js, and PostgreSQL.",
        employmentType: "FULL_TIME",
        workplaceType: "REMOTE",
        location: null,
        minExperience: 4,
        maxExperience: 8,
        status: "PUBLISHED",
        requirementsVersion: 1,
        skills: [
            { name: "React", isRequired: true },
            { name: "Node.js", isRequired: true },
            { name: "TypeScript", isRequired: true },
            { name: "PostgreSQL", isRequired: false },
            { name: "GraphQL", isRequired: false }
        ],
        updatedAt: new Date()
    };
    describe("LEVEL 1: Deterministic Scoring", () => {
        it("should calculate high deterministic score for a well-matched candidate", () => {
            const result = MatchingScorerService.calculateDeterministicScore(mockCandidate, mockJob);
            expect(result.score).toBeGreaterThanOrEqual(85);
            expect(result.factors.skills.requiredMatched).toEqual(expect.arrayContaining(["React", "Node.js", "TypeScript"]));
            expect(result.factors.skills.requiredMissing).toHaveLength(0);
            expect(result.factors.skills.requiredMatchPercentage).toBe(100);
            expect(result.factors.experience.levelFit).toBe("STRONG_FIT");
            expect(result.factors.location.isRemoteCompatible).toBe(true);
            expect(result.factors.role.titleSimilarity).toBeGreaterThan(50);
        });
        it("should penalize score when candidate is missing required skills", () => {
            const candidateWithoutSkills = {
                ...mockCandidate,
                skills: [{ name: "Python", yearsOfExperience: 2 }]
            };
            const result = MatchingScorerService.calculateDeterministicScore(candidateWithoutSkills, mockJob);
            expect(result.score).toBeLessThanOrEqual(60);
            expect(result.factors.skills.requiredMissing).toEqual(expect.arrayContaining(["React", "Node.js", "TypeScript"]));
            expect(result.factors.skills.score).toBeLessThan(15);
        });
        it("should handle experience boundaries (underqualified candidate)", () => {
            const juniorCandidate = {
                ...mockCandidate,
                totalExperience: 1.0,
                skills: []
            };
            const result = MatchingScorerService.calculateDeterministicScore(juniorCandidate, mockJob);
            expect(result.factors.experience.score).toBeLessThan(15);
            expect(result.factors.experience.levelFit).toMatch(/BELOW_MINIMUM|UNDERQUALIFIED/);
        });
        it("should award full location points for REMOTE jobs regardless of candidate location", () => {
            const candidateRemote = {
                ...mockCandidate,
                currentLocation: "Tokyo, Japan"
            };
            const result = MatchingScorerService.calculateDeterministicScore(candidateRemote, mockJob);
            expect(result.factors.location.score).toBe(15);
            expect(result.factors.location.workplaceType).toBe("REMOTE");
        });
        it("should evaluate onsite location match correctly", () => {
            const onsiteJob = {
                ...mockJob,
                workplaceType: "ONSITE",
                location: "San Francisco, CA"
            };
            const resultMatch = MatchingScorerService.calculateDeterministicScore(mockCandidate, onsiteJob);
            expect(resultMatch.factors.location.score).toBe(15);
            const nonLocalCandidate = {
                ...mockCandidate,
                currentLocation: "London, UK",
                preferredLocation: null
            };
            const resultMismatch = MatchingScorerService.calculateDeterministicScore(nonLocalCandidate, onsiteJob);
            expect(resultMismatch.factors.location.score).toBeLessThan(6);
        });
    });
    describe("LEVEL 2: Optional Semantic / AI Scoring", () => {
        it("should skip AI evaluation if deterministic score is below threshold (< 70)", async () => {
            const spyGenerateText = jest.spyOn(OpenRouterClient, "generateText");
            const lowScore = 55;
            const semanticResult = await MatchingScorerService.calculateSemanticScore(mockCandidate, mockJob, lowScore);
            expect(semanticResult.usedAI).toBe(false);
            expect(semanticResult.score).toBe(lowScore);
            expect(spyGenerateText).not.toHaveBeenCalled();
            spyGenerateText.mockRestore();
        });
        it("should invoke AI evaluation when deterministic score >= 70 and blend score", async () => {
            const spyGenerateText = jest.spyOn(OpenRouterClient, "generateText").mockResolvedValue(JSON.stringify({
                semanticScore: 92,
                reasoning: "Excellent full stack synergy."
            }));
            const deterministicScore = 85;
            const semanticResult = await MatchingScorerService.calculateSemanticScore(mockCandidate, mockJob, deterministicScore);
            expect(semanticResult.usedAI).toBe(true);
            expect(semanticResult.score).toBe(92);
            expect(spyGenerateText).toHaveBeenCalledTimes(1);
            const finalBlended = MatchingScorerService.blendFinalScore(deterministicScore, semanticResult);
            // Blended: (85 * 0.8) + (92 * 0.2) = 68 + 18.4 = 86.4 -> 86
            expect(finalBlended).toBe(86);
            spyGenerateText.mockRestore();
        });
        it("should gracefully fallback to deterministic score if AI throws error", async () => {
            const spyGenerateText = jest.spyOn(OpenRouterClient, "generateText").mockRejectedValue(new Error("OpenRouter rate limit or timeout"));
            const deterministicScore = 80;
            const semanticResult = await MatchingScorerService.calculateSemanticScore(mockCandidate, mockJob, deterministicScore);
            expect(semanticResult.usedAI).toBe(false);
            expect(semanticResult.score).toBe(deterministicScore);
            const finalBlended = MatchingScorerService.blendFinalScore(deterministicScore, semanticResult);
            expect(finalBlended).toBe(deterministicScore);
            spyGenerateText.mockRestore();
        });
    });
});
//# sourceMappingURL=matching-scorer.test.js.map