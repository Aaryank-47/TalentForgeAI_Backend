export interface ApplicationView {
    id: string;
    jobId: string;
    candidateId: string;
    status: string;
    appliedAt: Date;
    updatedAt: Date;
    applicationResume?: {
        id: string;
        fileName: string;
        fileUrl: string;
        fileSize: number;
        sourceResumeId?: string | null;
    } | null;
}

export interface ApplicationOverview {
    totalApplications: number;
    totalApplied: number;
    totalRejected: number;
    totalHired: number;
    totalWithdraw: number;
    applicationStages: {
        INREVIEW: number;
        HIRED: number;
        REJECTED: number;
        WITHDRAWN: number;
    }
}