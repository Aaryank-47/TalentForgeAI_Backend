export const MATCHING_WEIGHTS = {
    SKILLS: 40,
    EXPERIENCE: 25,
    LOCATION: 15,
    ROLE: 10,
    EDUCATION: 10,
};
export const MATCHING_SUB_WEIGHTS = {
    REQUIRED_SKILLS: 30,
    PREFERRED_SKILLS: 10,
};
export const MATCHING_THRESHOLDS = {
    /**
     * Minimum deterministic score required to qualify for Level 2 Semantic/AI evaluation.
     * Prevents calling AI on irrelevant candidates/jobs.
     */
    SEMANTIC_SCORING_MIN_THRESHOLD: 70,
    /**
     * Maximum candidates/jobs evaluated via AI in a single matching run.
     * Caps AI cost and prevents rate limiting.
     */
    MAX_SEMANTIC_EVALUATIONS: 10,
    /**
     * Blend ratio when semantic score is available:
     * Final = (Deterministic * 0.80) + (Semantic * 0.20)
     */
    DETERMINISTIC_BLEND_WEIGHT: 0.80,
    SEMANTIC_BLEND_WEIGHT: 0.20,
    /**
     * Maximum records retrieved from Elasticsearch / DB per matching event.
     */
    MAX_CANDIDATES_RETRIEVAL_LIMIT: 150,
    MAX_JOBS_RETRIEVAL_LIMIT: 100,
    /**
     * Minimum overall match score to persist as a viable candidate match (e.g. 20%)
     */
    MINIMUM_PERSISTENCE_SCORE: 20,
};
export const MATCHING_QUEUE_NAME = "matching-queue";
export const ES_MATCHING_INDICES = {
    CANDIDATES: "talentforge_candidates",
    JOBS: "talentforge_jobs",
};
export const ES_CANDIDATE_MAPPINGS = {
    properties: {
        id: { type: "keyword" },
        userId: { type: "keyword" },
        fullName: { type: "text", analyzer: "standard" },
        headline: { type: "text", analyzer: "standard" },
        currentDesignation: { type: "text", analyzer: "standard" },
        totalExperience: { type: "float" },
        experienceLevel: { type: "keyword" },
        currentLocation: { type: "text", analyzer: "standard" },
        preferredLocation: { type: "text", analyzer: "standard" },
        isOpenToWork: { type: "boolean" },
        skills: { type: "keyword" },
        skillText: { type: "text", analyzer: "standard" },
        educationDegrees: { type: "text", analyzer: "standard" },
        certifications: { type: "text", analyzer: "standard" },
        profileVersion: { type: "integer" },
        updatedAt: { type: "date" },
    },
};
export const ES_JOB_MAPPINGS = {
    properties: {
        id: { type: "keyword" },
        companyId: { type: "keyword" },
        title: { type: "text", analyzer: "standard" },
        summary: { type: "text", analyzer: "standard" },
        description: { type: "text", analyzer: "standard" },
        employmentType: { type: "keyword" },
        workplaceType: { type: "keyword" },
        location: { type: "text", analyzer: "standard" },
        minExperience: { type: "integer" },
        maxExperience: { type: "integer" },
        status: { type: "keyword" },
        skills: { type: "keyword" },
        skillText: { type: "text", analyzer: "standard" },
        requirementsVersion: { type: "integer" },
        updatedAt: { type: "date" },
    },
};
//# sourceMappingURL=matching.constants.js.map