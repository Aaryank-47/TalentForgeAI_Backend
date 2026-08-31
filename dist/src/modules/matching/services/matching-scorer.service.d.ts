import type { CandidateMatchingProfile, JobMatchingRequirements, DeterministicScoreResult, SemanticScoreResult } from "../interfaces/matching.interface.js";
export declare class MatchingScorerService {
    static calculateDeterministicScore(candidate: CandidateMatchingProfile, job: JobMatchingRequirements): DeterministicScoreResult;
    static calculateSemanticScore(candidate: CandidateMatchingProfile, job: JobMatchingRequirements, deterministicScore: number): Promise<SemanticScoreResult>;
    /**
     * Blends deterministic score and semantic score according to configured weights.
     */
    static blendFinalScore(deterministicScore: number, semanticResult: SemanticScoreResult | null): number;
    private static evaluateSkills;
    private static evaluateExperience;
    private static evaluateLocation;
    private static evaluateRole;
    private static evaluateEducation;
    private static hasPartialSkillMatch;
    private static calculateTitleSimilarity;
    private static parseAiResponse;
}
//# sourceMappingURL=matching-scorer.service.d.ts.map