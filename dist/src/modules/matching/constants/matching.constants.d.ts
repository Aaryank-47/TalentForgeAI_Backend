export declare const MATCHING_WEIGHTS: {
    readonly SKILLS: 40;
    readonly EXPERIENCE: 25;
    readonly LOCATION: 15;
    readonly ROLE: 10;
    readonly EDUCATION: 10;
};
export declare const MATCHING_SUB_WEIGHTS: {
    readonly REQUIRED_SKILLS: 30;
    readonly PREFERRED_SKILLS: 10;
};
export declare const MATCHING_THRESHOLDS: {
    /**
     * Minimum deterministic score required to qualify for Level 2 Semantic/AI evaluation.
     * Prevents calling AI on irrelevant candidates/jobs.
     */
    readonly SEMANTIC_SCORING_MIN_THRESHOLD: 70;
    /**
     * Maximum candidates/jobs evaluated via AI in a single matching run.
     * Caps AI cost and prevents rate limiting.
     */
    readonly MAX_SEMANTIC_EVALUATIONS: 10;
    /**
     * Blend ratio when semantic score is available:
     * Final = (Deterministic * 0.80) + (Semantic * 0.20)
     */
    readonly DETERMINISTIC_BLEND_WEIGHT: 0.8;
    readonly SEMANTIC_BLEND_WEIGHT: 0.2;
    /**
     * Maximum records retrieved from Elasticsearch / DB per matching event.
     */
    readonly MAX_CANDIDATES_RETRIEVAL_LIMIT: 150;
    readonly MAX_JOBS_RETRIEVAL_LIMIT: 100;
    /**
     * Minimum overall match score to persist as a viable candidate match (e.g. 20%)
     */
    readonly MINIMUM_PERSISTENCE_SCORE: 20;
};
export declare const MATCHING_QUEUE_NAME = "matching-queue";
export declare const ES_MATCHING_INDICES: {
    readonly CANDIDATES: "talentforge_candidates";
    readonly JOBS: "talentforge_jobs";
};
export declare const ES_CANDIDATE_MAPPINGS: {
    readonly properties: {
        readonly id: {
            readonly type: "keyword";
        };
        readonly userId: {
            readonly type: "keyword";
        };
        readonly fullName: {
            readonly type: "text";
            readonly analyzer: "standard";
        };
        readonly headline: {
            readonly type: "text";
            readonly analyzer: "standard";
        };
        readonly currentDesignation: {
            readonly type: "text";
            readonly analyzer: "standard";
        };
        readonly totalExperience: {
            readonly type: "float";
        };
        readonly experienceLevel: {
            readonly type: "keyword";
        };
        readonly currentLocation: {
            readonly type: "text";
            readonly analyzer: "standard";
        };
        readonly preferredLocation: {
            readonly type: "text";
            readonly analyzer: "standard";
        };
        readonly isOpenToWork: {
            readonly type: "boolean";
        };
        readonly skills: {
            readonly type: "keyword";
        };
        readonly skillText: {
            readonly type: "text";
            readonly analyzer: "standard";
        };
        readonly educationDegrees: {
            readonly type: "text";
            readonly analyzer: "standard";
        };
        readonly certifications: {
            readonly type: "text";
            readonly analyzer: "standard";
        };
        readonly profileVersion: {
            readonly type: "integer";
        };
        readonly updatedAt: {
            readonly type: "date";
        };
    };
};
export declare const ES_JOB_MAPPINGS: {
    readonly properties: {
        readonly id: {
            readonly type: "keyword";
        };
        readonly companyId: {
            readonly type: "keyword";
        };
        readonly title: {
            readonly type: "text";
            readonly analyzer: "standard";
        };
        readonly summary: {
            readonly type: "text";
            readonly analyzer: "standard";
        };
        readonly description: {
            readonly type: "text";
            readonly analyzer: "standard";
        };
        readonly employmentType: {
            readonly type: "keyword";
        };
        readonly workplaceType: {
            readonly type: "keyword";
        };
        readonly location: {
            readonly type: "text";
            readonly analyzer: "standard";
        };
        readonly minExperience: {
            readonly type: "integer";
        };
        readonly maxExperience: {
            readonly type: "integer";
        };
        readonly status: {
            readonly type: "keyword";
        };
        readonly skills: {
            readonly type: "keyword";
        };
        readonly skillText: {
            readonly type: "text";
            readonly analyzer: "standard";
        };
        readonly requirementsVersion: {
            readonly type: "integer";
        };
        readonly updatedAt: {
            readonly type: "date";
        };
    };
};
//# sourceMappingURL=matching.constants.d.ts.map