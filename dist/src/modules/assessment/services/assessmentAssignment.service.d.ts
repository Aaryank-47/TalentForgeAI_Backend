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