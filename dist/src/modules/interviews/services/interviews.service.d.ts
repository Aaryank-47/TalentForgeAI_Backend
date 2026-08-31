import type { CreateInterviewDto, InterviewListQueryDto, UpdateInterviewDto, AttachInterviewToJobRequest, ReorderJobInterviewsRequest, CreateInterviewAssignmentsRequest, GetInterviewAssignmentsQueryDto, CreateInterviewSessionRequest, UpdateInterviewSessionRequest, AddSessionParticipantsRequest, SubmitInterviewEvaluationRequest } from "../dto/interviews.dto.js";
import type { InterviewResponse, PaginatedInterviewResponse, InterviewDetailResponse, JobInterviewResponse, JobInterviewWithInterviewResponse, RemoveJobInterviewResponse, InterviewAssignmentResponse, PaginatedInterviewAssignmentResponse, InterviewAssignmentDetailResponse, InterviewSessionResponse, InterviewSessionDetailResponse, InterviewSessionParticipantResponse } from "../interfaces/interviews.interface.js";
import { InterviewStatus } from "@prisma/client";
export declare class InterviewsServices {
    static createInterview(companyId: string, companyMemberId: string, data: CreateInterviewDto): Promise<InterviewResponse>;
    static getCompanyInterviews(companyId: string, query: InterviewListQueryDto): Promise<PaginatedInterviewResponse>;
    static getInterviewById(companyId: string, interviewId: string): Promise<InterviewDetailResponse>;
    static updateInterview(companyId: string, interviewId: string, data: UpdateInterviewDto): Promise<InterviewResponse>;
    static changeInterviewStatus(companyId: string, interviewId: string, status: InterviewStatus): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.InterviewStatus;
    }>;
    static deleteInterview(companyId: string, interviewId: string): Promise<{
        message: string;
    }>;
}
export declare class JobInterviewsServices {
    static attachInterviewToJob(companyId: string, jobId: string, data: AttachInterviewToJobRequest): Promise<JobInterviewResponse>;
    static getJobInterviews(companyId: string, jobId: string): Promise<JobInterviewWithInterviewResponse[]>;
    static removeInterviewFromJob(companyId: string, jobId: string, interviewId: string): Promise<RemoveJobInterviewResponse>;
    static reorderJobInterviews(companyId: string, jobId: string, data: ReorderJobInterviewsRequest): Promise<JobInterviewWithInterviewResponse[]>;
    static getAllJobInterviews(): Promise<any>;
}
export declare class InterviewAssignmentsServices {
    static getEligibleCandidates(companyId: string): Promise<{
        id: string;
        candidate: {
            fullName: string;
            user: {
                email: string;
            };
            id: string;
            profilePicture: string | null;
        };
        job: {
            id: string;
            title: string;
        };
        applicationWorkflow: {
            workflowStage: {
                stageLibrary: {
                    name: string;
                };
            };
        } | null;
    }[]>;
    static createInterviewAssignments(companyId: string, companyMemberId: string, interviewId: string, data: CreateInterviewAssignmentsRequest): Promise<InterviewAssignmentResponse[]>;
    static getInterviewAssignments(companyId: string, interviewId: string, query: GetInterviewAssignmentsQueryDto): Promise<PaginatedInterviewAssignmentResponse>;
    static getInterviewAssignment(companyId: string, interviewId: string, assignmentId: string): Promise<InterviewAssignmentDetailResponse>;
    static deleteInterviewAssignment(companyId: string, interviewId: string, assignmentId: string): Promise<{
        assignmentId: string;
    }>;
}
export declare class InterviewSessionsServices {
    static createSession(companyId: string, companyMemberId: string, interviewId: string, data: CreateInterviewSessionRequest): Promise<InterviewSessionResponse>;
    static expireOverdueSessions(companyId?: string): Promise<void>;
    static initAutoExpiryScheduler(intervalMs?: number): NodeJS.Timeout;
    static getInterviewSessions(companyId: string, interviewId: string): Promise<InterviewSessionResponse[]>;
    static getAllCompanySessions(companyId: string): Promise<InterviewSessionResponse[]>;
    static getSession(companyId: string, sessionId: string): Promise<InterviewSessionDetailResponse>;
    static updateSession(companyId: string, sessionId: string, data: UpdateInterviewSessionRequest): Promise<InterviewSessionResponse>;
    static cancelSession(companyId: string, sessionId: string, userId: string): Promise<InterviewSessionResponse>;
    static startSession(companyId: string, sessionId: string, userId: string): Promise<InterviewSessionResponse>;
    static endSession(companyId: string, sessionId: string, userId: string): Promise<InterviewSessionResponse>;
}
export declare class InterviewEvaluationServices {
    static submitEvaluation(companyId: string, sessionId: string, userId: string, data: SubmitInterviewEvaluationRequest): Promise<{
        companyMember: {
            user: {
                email: string;
                id: string;
                role: import("@prisma/client").$Enums.UserRole;
            };
        } & {
            companyId: string;
            id: string;
            role: import("@prisma/client").$Enums.CompanyMemberRole;
            status: import("@prisma/client").$Enums.CompanyMemberStatus;
            userId: string;
            joinedAt: Date;
            invitationToken: string | null;
            invitedAt: Date | null;
            expiresAt: Date | null;
            invitedBy: string | null;
        };
    } & {
        comments: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyMemberId: string;
        overallScore: number;
        communicationScore: number | null;
        technicalScore: number | null;
        problemSolvingScore: number | null;
        behaviourScore: number | null;
        cultureFitScore: number | null;
        recommendation: import("@prisma/client").$Enums.AIRecommendation | null;
        strengths: import("@prisma/client/runtime/client").JsonValue | null;
        improvements: import("@prisma/client/runtime/client").JsonValue | null;
        sessionId: string;
    }>;
    static getEvaluations(companyId: string, sessionId: string, userId: string): Promise<({
        companyMember: {
            user: {
                email: string;
                id: string;
                role: import("@prisma/client").$Enums.UserRole;
            };
        } & {
            companyId: string;
            id: string;
            role: import("@prisma/client").$Enums.CompanyMemberRole;
            status: import("@prisma/client").$Enums.CompanyMemberStatus;
            userId: string;
            joinedAt: Date;
            invitationToken: string | null;
            invitedAt: Date | null;
            expiresAt: Date | null;
            invitedBy: string | null;
        };
    } & {
        comments: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyMemberId: string;
        overallScore: number;
        communicationScore: number | null;
        technicalScore: number | null;
        problemSolvingScore: number | null;
        behaviourScore: number | null;
        cultureFitScore: number | null;
        recommendation: import("@prisma/client").$Enums.AIRecommendation | null;
        strengths: import("@prisma/client/runtime/client").JsonValue | null;
        improvements: import("@prisma/client/runtime/client").JsonValue | null;
        sessionId: string;
    })[]>;
}
export declare class InterviewSessionParticipantsServices {
    static addParticipants(companyId: string, sessionId: string, data: AddSessionParticipantsRequest): Promise<InterviewSessionParticipantResponse[]>;
    static getParticipants(companyId: string, sessionId: string): Promise<InterviewSessionParticipantResponse[]>;
    static removeParticipant(companyId: string, sessionId: string, participantId: string): Promise<void>;
    static verifyAndJoinSession(userId: string, sessionId: string): Promise<{
        participantId: string;
        participantType: string;
        sessionId: string;
        companyId: string;
        name: string;
        initials: string;
        avatarColor: string;
    }>;
}
//# sourceMappingURL=interviews.service.d.ts.map