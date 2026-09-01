import { describe, expect, it, jest } from "@jest/globals";
import { MatchingService } from "../services/matching.service.js";
import { MatchingRepository } from "../repositories/matching.repository.js";
import { MatchingRetrievalService } from "../services/matching-retrieval.service.js";
import { MatchingScorerService } from "../services/matching-scorer.service.js";
import { MatchingElasticsearchService } from "../services/matching-elasticsearch.service.js";
describe("Matching Performance & Scalability Diagnostics", () => {
    jest.setTimeout(15000);
    it("should process targeted candidate subset without Cartesian product scan across full candidate base", async () => {
        const mockJob = {
            id: "job_scalable",
            companyId: "comp_1",
            title: "Staff Node.js Engineer",
            summary: "Backend engineer",
            description: "Building scalable distributed backend services using Node.js, TypeScript, PostgreSQL",
            employmentType: "FULL_TIME",
            workplaceType: "REMOTE",
            location: null,
            minExperience: 5,
            maxExperience: 10,
            status: "PUBLISHED",
            requirementsVersion: 1,
            skills: [
                { name: "Node.js", isRequired: true },
                { name: "TypeScript", isRequired: true },
                { name: "PostgreSQL", isRequired: false }
            ],
            updatedAt: new Date()
        };
        // Simulate 100 targeted candidates retrieved (out of a conceptual 100,000 candidate database)
        const mockFilteredCandidates = Array.from({ length: 100 }, (_, i) => ({
            id: `cand_${i + 1}`,
            userId: `user_${i + 1}`,
            fullName: `Candidate ${i + 1}`,
            headline: "Software Engineer",
            currentDesignation: "Software Engineer",
            totalExperience: 4 + (i % 6),
            experienceLevel: "SENIOR",
            currentLocation: "San Francisco, CA",
            preferredLocation: "San Francisco, CA",
            isOpenToWork: true,
            profileVersion: 1,
            skills: [
                { name: "Node.js", yearsOfExperience: 4 },
                { name: "TypeScript", yearsOfExperience: 3 }
            ],
            educationDegrees: ["B.S. in CS"],
            certificationNames: [],
            updatedAt: new Date()
        }));
        jest.spyOn(MatchingRepository, "getJobMatchingRequirements").mockResolvedValue(mockJob);
        jest.spyOn(MatchingElasticsearchService, "indexJob").mockResolvedValue();
        jest.spyOn(MatchingRetrievalService, "retrieveCandidatesForJob").mockResolvedValue(mockFilteredCandidates);
        jest.spyOn(MatchingRepository, "upsertMatch").mockResolvedValue();
        let aiCallCount = 0;
        jest.spyOn(MatchingScorerService, "calculateSemanticScore").mockImplementation(async (_cand, _job, score) => {
            aiCallCount++;
            return {
                score: score + 5,
                reasoning: "Good fit",
                usedAI: true
            };
        });
        const metrics = await MatchingService.matchForJob("job_scalable");
        // Verifications:
        // 1. Exactly 100 candidates were evaluated deterministically (targeted pool)
        expect(metrics.candidatesRetrieved).toBe(100);
        expect(metrics.deterministicEvaluated).toBe(100);
        // 2. AI scoring was strictly capped to top-10 shortlisted candidates (Max Semantic Evaluations)
        expect(metrics.aiEvaluated).toBeLessThanOrEqual(10);
        expect(aiCallCount).toBeLessThanOrEqual(10);
        // 3. Persisted matches were saved without Cartesian explosion
        expect(metrics.matchesPersisted).toBeGreaterThan(0);
        expect(metrics.durationMs).toBeLessThan(3000); // Execution within reasonable bound under parallel load
    });
});
//# sourceMappingURL=matching-performance.test.js.map