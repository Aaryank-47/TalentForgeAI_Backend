export interface JobAssessmentAssignmentResponse {
    jobId: string;
    assignedCount: number;
}
export interface JobAssessmentDetail {
    id: string;
    assessment: {
        id: string;
        title: string;
        status: string;
        durationMinutes: number | null;
    };
}
export type JobAssessmentListResponse = JobAssessmentDetail[];
export interface CreateAssessmentInvitationResponse {
    invitationId: string;
    assessmentId: string;
    token: string;
    expiresAt: Date;
}
export interface GetAssessmentInvitationResponse {
    id: string;
    status: string;
    assessmentTitle: string;
    expiresAt: Date;
}
export interface AssessmentInvitationPreviewResponse {
    candidateName: string;
    assessmentTitle: string;
    duration: number | null;
    expiresAt: Date;
}
export interface AssessmentAttemptStartResponse {
    attemptId: string;
    startedAt: Date;
    remainingTime: number;
}
//# sourceMappingURL=assessmentAssignment.interface.d.ts.map