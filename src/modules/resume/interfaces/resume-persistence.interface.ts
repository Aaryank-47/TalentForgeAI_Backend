import type { ResumeParsingResult } from "./resume-parser.interface.js";
import type { ResumeProcessingStage } from "../queues/resume-processing.types.js";

export type ExperienceValues = {
    companyName: string;
    designation: string;
    employmentType: NonNullable<ResumeParsingResult["experience"][number]["employmentType"]>;
    description: string | null;
    location: string | null;
    startDate: Date;
    endDate: Date | null;
    currentlyWorking: boolean;
};

export type EducationValues = {
    collegeName: string;
    degree: string;
    fieldOfStudy: string;
    currentlyStudying: boolean;
    startDate: Date;
    endDate: Date | null;
    gradingSystem: NonNullable<ResumeParsingResult["education"][number]["gradingSystem"]>;
    gradeText: string | null;
    grade: number | null;
};

export interface ResumePersistenceResult {
    candidateId: string;
    skillsCreated: number;
    skillsUpdated: number;
    experiencesCreated: number;
    experiencesUpdated: number;
    educationCreated: number;
    educationUpdated: number;
    projectsCreated: number;
    projectsUpdated: number;
    certificationsCreated: number;
    certificationsUpdated: number;
}

export interface StageChangeMeta {
    jobId: string;
    resumeId: string;
    candidateId: string;
    mode?: "DIRECT" | "FALLBACK";
    reason?: string;
}

export type StageChangeHandler = (
    stage: ResumeProcessingStage,
    meta: StageChangeMeta
) => Promise<void> | void;

export interface PipelineExecutionResult {
    parsedData: ResumeParsingResult;
    normalizedData: ResumeParsingResult;
    persistenceResult: ResumePersistenceResult;
    durationMs: number;
}