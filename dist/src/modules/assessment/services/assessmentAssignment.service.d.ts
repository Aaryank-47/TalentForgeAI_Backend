import type { AttachAssessmentsToJobDto, ReorderJobAssessmentsDto, CreateAssessmentInvitationDto } from "../dto/assessmentAssignment.dto.js";
import type { JobAssessmentAssignmentResponse, JobAssessmentListResponse, CreateAssessmentInvitationResponse, AssessmentInvitationPreviewResponse } from "../interfaces/assessmentAssignment.interface.js";
import type { AuthTokenPayload } from "../../auth/interfaces/auth.interface.js";
export declare class JobAssessmentService {
    static attachAssessmentsToJob(jobId: string, dto: AttachAssessmentsToJobDto, user: AuthTokenPayload): Promise<JobAssessmentAssignmentResponse>;
    static getJobAssessments(jobId: string): Promise<JobAssessmentListResponse>;
    static updateJobAssessment(jobId: string, dto: AttachAssessmentsToJobDto, user: AuthTokenPayload): Promise<JobAssessmentAssignmentResponse>;
    static removeJobAssessment(jobAssessmentId: string): Promise<void>;
    static reorderJobAssessments(dto: ReorderJobAssessmentsDto): Promise<void>;
    static createAssessmentInvitation(applicationId: string, dto: CreateAssessmentInvitationDto, idempotencyKey?: string): Promise<CreateAssessmentInvitationResponse>;
    static getCandidateMyInvitations(userId: string): Promise<{
        id: string;
        invitationId: string;
        token: string;
        applicationId: string;
        status: string;
        expiresAt: Date;
        createdAt: Date;
        assessmentId: string;
        assessment: {
            description: string | null;
            company: {
                companyName: string;
                logo: string | null;
                id: string;
            };
            id: string;
            title: string;
            instructions: string | null;
            durationMinutes: number | null;
            passingScore: number | null;
            totalMarks: number | null;
        };
        application: {
            id: string;
            assessmentAttempts: {
                id: string;
                status: import("@prisma/client").$Enums.AttemptStatus;
                createdAt: Date;
                updatedAt: Date;
                candidateId: string;
                assessmentId: string;
                applicationId: string;
                currentSectionId: string | null;
                startedAt: Date | null;
                submittedAt: Date | null;
                lastActivityAt: Date | null;
                attemptNumber: number;
                timeTakenInSeconds: number | null;
                completedDurationSeconds: number | null;
                overallScore: number | null;
                percentage: number | null;
                passed: boolean | null;
                evaluationStatus: import("@prisma/client").$Enums.EvaluationStatus;
                reviewStatus: import("@prisma/client").$Enums.ReviewStatus;
            }[];
            job: {
                company: {
                    companyName: string;
                    logo: string | null;
                    id: string;
                };
                location: string | null;
                id: string;
                title: string;
                workplaceType: import("@prisma/client").$Enums.WorkplaceType;
            };
        };
        attempt: {
            id: string;
            status: import("@prisma/client").$Enums.AttemptStatus;
            score: any;
            percentage: any;
            passed: any;
            startedAt: Date | null;
            submittedAt: any;
        } | null;
    }[]>;
    static getAssessmentInvitation(applicationId: string): Promise<{
        id: string;
        token: string;
        applicationId: string;
        status: string;
        expiresAt: Date;
        createdAt: Date;
        assessment: {
            id: string;
            title: string;
            description: string | null;
            instructions: string | null;
            durationMinutes: number | null;
            passingScore: number | null;
            totalMarks: number | null;
            company: {
                companyName: string;
                logo: string | null;
                id: string;
            };
        };
        job: {
            company: {
                companyName: string;
                logo: string | null;
                id: string;
            };
            location: string | null;
            id: string;
            title: string;
            workplaceType: import("@prisma/client").$Enums.WorkplaceType;
        };
        attempt: {
            id: string;
            status: import("@prisma/client").$Enums.AttemptStatus;
            overallScore: number | null;
            percentage: number | null;
            startedAt: Date | null;
            submittedAt: Date | null;
        } | null;
    }>;
    static validateInvitation(token: string): Promise<AssessmentInvitationPreviewResponse>;
    static resendInvitation(id: string): Promise<void>;
    static cancelInvitation(id: string): Promise<void>;
    static expireInvitation(id: string): Promise<void>;
}
//# sourceMappingURL=assessmentAssignment.service.d.ts.map