export interface ApplicationAssessmentResultResponse {
    applicationId: string;
    assessmentAttemptId: string;
    assessmentId: string;
    assessmentTitle: string;
    score: number;
    totalMarks?: number;
    percentage: number;
    passingScore?: number;
    passed: boolean;
    evaluationStatus: string;
    submittedAt: Date;
    evaluatedAt: Date | null;
    answers?: any[];
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
//# sourceMappingURL=atsIntegration.interface.d.ts.map