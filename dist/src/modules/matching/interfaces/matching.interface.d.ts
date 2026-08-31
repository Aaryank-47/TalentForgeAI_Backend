import type { MatchStatus, WorkplaceType, EmploymentType, ExperienceLevel } from "@prisma/client";
export interface CandidateSkillMatchDetail {
    name: string;
    yearsOfExperience: number | null;
    isCanonical?: boolean;
}
export interface CandidateMatchingProfile {
    id: string;
    userId: string;
    fullName: string;
    headline: string | null;
    currentDesignation: string | null;
    totalExperience: number | null;
    experienceLevel: ExperienceLevel | null;
    currentLocation: string | null;
    preferredLocation: string | null;
    isOpenToWork: boolean;
    profileVersion: number;
    skills: CandidateSkillMatchDetail[];
    educationDegrees: string[];
    certificationNames: string[];
    updatedAt: Date;
}
export interface JobSkillMatchDetail {
    name: string;
    isRequired: boolean;
}
export interface JobMatchingRequirements {
    id: string;
    companyId: string;
    title: string;
    summary: string | null;
    description: string;
    employmentType: EmploymentType;
    workplaceType: WorkplaceType;
    location: string | null;
    minExperience: number;
    maxExperience: number;
    status: string;
    requirementsVersion: number;
    skills: JobSkillMatchDetail[];
    updatedAt: Date;
}
export interface MatchingFactors {
    skills: {
        score: number;
        maxScore: number;
        requiredMatched: string[];
        requiredMissing: string[];
        preferredMatched: string[];
        preferredMissing: string[];
        requiredMatchPercentage: number;
        preferredMatchPercentage: number;
    };
    experience: {
        score: number;
        maxScore: number;
        candidateYoe: number;
        minRequiredYoe: number;
        maxRequiredYoe: number;
        levelFit: string;
    };
    location: {
        score: number;
        maxScore: number;
        workplaceType: WorkplaceType;
        jobLocation: string | null;
        candidateLocation: string | null;
        isRemoteCompatible: boolean;
    };
    role: {
        score: number;
        maxScore: number;
        jobTitle: string;
        candidateDesignation: string | null;
        candidateHeadline: string | null;
        titleSimilarity: number;
    };
    education: {
        score: number;
        maxScore: number;
        matchedDegrees: string[];
        matchedCertifications: string[];
    };
}
export interface DeterministicScoreResult {
    score: number;
    factors: MatchingFactors;
}
export interface SemanticScoreResult {
    score: number;
    reasoning?: string;
    usedAI: boolean;
}
export interface MatchCalculationResult {
    candidateId: string;
    jobId: string;
    matchScore: number;
    deterministicScore: number;
    semanticScore: number | null;
    matchingFactors: MatchingFactors;
    candidateVersion: number;
    jobVersion: number;
    status: MatchStatus;
}
export type MatchingJobType = "MATCH_FOR_JOB" | "MATCH_FOR_CANDIDATE" | "RECALCULATE_PAIR";
export interface MatchingJobData {
    type: MatchingJobType;
    jobId?: string;
    candidateId?: string;
    jobVersion?: number;
    candidateVersion?: number;
    triggeredBy?: string;
    timestamp: number;
}
export interface MatchingMetrics {
    jobId?: string;
    candidateId?: string;
    candidatesRetrieved?: number;
    jobsRetrieved?: number;
    deterministicEvaluated: number;
    aiEvaluated: number;
    matchesPersisted: number;
    durationMs: number;
}
export interface CandidateMatchedJobView {
    id: string;
    jobId: string;
    matchScore: number;
    deterministicScore: number;
    semanticScore: number | null;
    matchingFactors: MatchingFactors;
    status: MatchStatus;
    calculatedAt: string;
    job: {
        id: string;
        title: string;
        slug: string;
        summary: string | null;
        employmentType: string;
        workplaceType: string;
        location: string | null;
        minExperience: number;
        maxExperience: number;
        minimumSalary: number | null;
        maximumSalary: number | null;
        salaryPeriod: string | null;
        publishedAt: string | null;
        company: {
            id: string;
            companyName: string;
            logo: string | null;
            industry: string | null;
            isVerified: boolean;
        };
        skills: Array<{
            id: string;
            name: string;
            isRequired: boolean;
        }>;
    };
}
export interface RecruiterMatchedCandidateView {
    id: string;
    candidateId: string;
    matchScore: number;
    deterministicScore: number;
    semanticScore: number | null;
    matchingFactors: MatchingFactors;
    status: MatchStatus;
    calculatedAt: string;
    candidate: {
        id: string;
        fullName: string;
        headline: string | null;
        profilePicture: string | null;
        currentDesignation: string | null;
        currentCompany: string | null;
        totalExperience: number | null;
        experienceLevel: string | null;
        currentLocation: string | null;
        preferredLocation: string | null;
        isOpenToWork: boolean;
        skills: Array<{
            id: string;
            name: string;
            yearsOfExperience: number | null;
        }>;
        educations: Array<{
            id: string;
            collegeName: string;
            degree: string;
            fieldOfStudy: string;
        }>;
        experiences: Array<{
            id: string;
            companyName: string;
            designation: string;
            startDate: string;
            endDate: string | null;
            currentlyWorking: boolean;
        }>;
    };
}
//# sourceMappingURL=matching.interface.d.ts.map