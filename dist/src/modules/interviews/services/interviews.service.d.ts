import type { CreateInterviewDto, InterviewListQueryDto, UpdateInterviewDto, AttachInterviewToJobRequest, ReorderJobInterviewsRequest, CreateInterviewAssignmentsRequest, GetInterviewAssignmentsQueryDto, CreateInterviewSessionRequest, UpdateInterviewSessionRequest, AddSessionParticipantsRequest } from "../dto/interviews.dto.js";
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
}
export declare class JobInterviewsServices {
    static attachInterviewToJob(companyId: string, jobId: string, data: AttachInterviewToJobRequest): Promise<JobInterviewResponse>;
    static getJobInterviews(companyId: string, jobId: string): Promise<JobInterviewWithInterviewResponse[]>;
    static removeInterviewFromJob(companyId: string, jobId: string, interviewId: string): Promise<RemoveJobInterviewResponse>;
    static reorderJobInterviews(companyId: string, jobId: string, data: ReorderJobInterviewsRequest): Promise<JobInterviewWithInterviewResponse[]>;
    static getAllJobInterviews(): Promise<any>;
}
export declare class InterviewAssignmentsServices {
    static createInterviewAssignments(companyId: string, companyMemberId: string, interviewId: string, data: CreateInterviewAssignmentsRequest): Promise<InterviewAssignmentResponse[]>;
    static getInterviewAssignments(companyId: string, interviewId: string, query: GetInterviewAssignmentsQueryDto): Promise<PaginatedInterviewAssignmentResponse>;
    static getInterviewAssignment(companyId: string, interviewId: string, assignmentId: string): Promise<InterviewAssignmentDetailResponse>;
    static deleteInterviewAssignment(companyId: string, interviewId: string, assignmentId: string): Promise<{
        assignmentId: string;
    }>;
}
export declare class InterviewSessionsServices {
    static createSession(companyId: string, interviewId: string, data: CreateInterviewSessionRequest): Promise<InterviewSessionResponse>;
    static getInterviewSessions(companyId: string, interviewId: string): Promise<InterviewSessionResponse[]>;
    static getSession(companyId: string, sessionId: string): Promise<InterviewSessionDetailResponse>;
    static updateSession(companyId: string, sessionId: string, data: UpdateInterviewSessionRequest): Promise<InterviewSessionResponse>;
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
    }>;
}
//# sourceMappingURL=interviews.service.d.ts.map