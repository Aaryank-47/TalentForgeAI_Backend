import type { AttachAssessmentsToJobDto, ReorderJobAssessmentsDto, CreateAssessmentInvitationDto } from "../dto/assessmentAssignment.dto.js";
import type { JobAssessmentAssignmentResponse, JobAssessmentListResponse, CreateAssessmentInvitationResponse, GetAssessmentInvitationResponse, AssessmentInvitationPreviewResponse } from "../interfaces/assessmentAssignment.interface.js";
import type { AuthTokenPayload } from "../../auth/interfaces/auth.interface.js";
export declare class JobAssessmentService {
    static attachAssessmentsToJob(jobId: string, dto: AttachAssessmentsToJobDto, user: AuthTokenPayload): Promise<JobAssessmentAssignmentResponse>;
    static getJobAssessments(jobId: string): Promise<JobAssessmentListResponse>;
    static updateJobAssessment(jobId: string, dto: AttachAssessmentsToJobDto, user: AuthTokenPayload): Promise<JobAssessmentAssignmentResponse>;
    static removeJobAssessment(jobAssessmentId: string): Promise<void>;
    static reorderJobAssessments(dto: ReorderJobAssessmentsDto): Promise<void>;
    static createAssessmentInvitation(applicationId: string, dto: CreateAssessmentInvitationDto, idempotencyKey?: string): Promise<CreateAssessmentInvitationResponse>;
    static getAssessmentInvitation(applicationId: string): Promise<GetAssessmentInvitationResponse>;
    static validateInvitation(token: string): Promise<AssessmentInvitationPreviewResponse>;
    static resendInvitation(id: string): Promise<void>;
    static cancelInvitation(id: string): Promise<void>;
    static expireInvitation(id: string): Promise<void>;
}
//# sourceMappingURL=assessmentAssignment.service.d.ts.map