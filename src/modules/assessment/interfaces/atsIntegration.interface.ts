export interface ApplicationAssessmentResultResponse {
    applicationId: string;
    assessmentAttemptId: string;
    assessmentId: string;
    assessmentTitle: string;
    score: number;
    percentage: number;
    passed: boolean;
    evaluationStatus: string;
    submittedAt: Date;
    evaluatedAt: Date | null;
}

export interface ATSAssessmentProcessingResult {
    applicationId: string;
    attemptId: string;
    result: "PASSED" | "FAILED";
    currentStageId: string | null;
    nextStageId: string | null;
    action: "MOVE_TO_NEXT_STAGE" | "REJECT_APPLICATION" | "RECRUITER_REVIEW";
}

export interface AssessmentOutcome {
    outcome: "PASSED" | "FAILED";
    action: "MOVE_TO_NEXT_STAGE" | "REJECT_APPLICATION" | "RECRUITER_REVIEW";
}
