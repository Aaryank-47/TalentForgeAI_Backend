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

