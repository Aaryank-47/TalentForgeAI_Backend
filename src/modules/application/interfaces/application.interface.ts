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

export interface ApplicationListResult {
    applications: any[];
    total: number;
}

export type ApplicationDetailResult = NonNullable<Awaited<ReturnType<typeof import("../repositories/application.repository.js").ApplicationRepository.getJobApplicationDetails>>>;