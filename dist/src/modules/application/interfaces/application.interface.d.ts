export interface ApplicationView {
    id: string;
    jobId: string;
    candidateId: string;
    resumeId: string;
    status: string;
    appliedAt: Date;
    updatedAt: Date;
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
    };
}
//# sourceMappingURL=application.interface.d.ts.map