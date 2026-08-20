import type { Prisma, InterviewStatus } from "@prisma/client";
import { type InterviewResponse, type InterviewSummary, type InterviewDetailPayload, type CreateJobInterviewData, type JobInterviewWithInterviewPayload, type InterviewAssignmentResponse, type InterviewAssignmentDetailResponse, type InterviewSessionResponse, type InterviewSessionDetailResponse, type InterviewSessionParticipantResponse } from "../interfaces/interviews.interface.js";
import type { PaginationResult } from "../../../common/types/pagination.types.js";
export declare class InterviewsRepositories {
    static createInterview(data: Prisma.InterviewCreateInput): Promise<InterviewResponse>;
    static getCompanyInterviews(companyId: string, pagination: PaginationResult, filters: {
        status?: any;
        type?: any;
        mode?: any;
        search?: string;
    }): Promise<{
        data: InterviewSummary[];
        total: number;
    }>;
    static getInterviewById(companyId: string, interviewId: string): Promise<InterviewDetailPayload | null>;
    static updateInterview(companyId: string, interviewId: string, data: Prisma.InterviewUpdateInput): Promise<InterviewResponse>;
    static changeInterviewStatus(companyId: string, interviewId: string, status: InterviewStatus): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.InterviewStatus;
    }>;
}
export declare class JobInterviewsRepositories {
    static createJobInterview(data: CreateJobInterviewData): Promise<{
        createdAt: Date;
        jobId: string;
        interviewId: string;
        displayOrder: number;
        isMandatory: boolean;
    }>;
    static findJobInterviews(jobId: string): Promise<JobInterviewWithInterviewPayload[]>;
    static findAllJobInterviews(): Promise<({
        interview: {
            type: import("@prisma/client").$Enums.InterviewType;
            companyId: string;
            description: string | null;
            id: string;
            status: import("@prisma/client").$Enums.InterviewStatus;
            createdAt: Date;
            updatedAt: Date;
            mode: import("@prisma/client").$Enums.InterviewMode;
            title: string;
            createdById: string;
            instructions: string | null;
            durationMinutes: number | null;
        };
    } & {
        createdAt: Date;
        jobId: string;
        interviewId: string;
        displayOrder: number;
        isMandatory: boolean;
    })[]>;
    static findJobInterview(jobId: string, interviewId: string): Promise<{
        createdAt: Date;
        jobId: string;
        interviewId: string;
        displayOrder: number;
        isMandatory: boolean;
    } | null>;
    static findLastJobInterview(jobId: string): Promise<{
        createdAt: Date;
        jobId: string;
        interviewId: string;
        displayOrder: number;
        isMandatory: boolean;
    } | null>;
    static deleteJobInterview(jobId: string, interviewId: string): Promise<{
        createdAt: Date;
        jobId: string;
        interviewId: string;
        displayOrder: number;
        isMandatory: boolean;
    }>;
    static deleteAllJobInterviewsByInterviewId(interviewId: string): Promise<Prisma.BatchPayload>;
    static updateJobInterviewOrders(jobId: string, orders: {
        interviewId: string;
        displayOrder: number;
    }[]): Promise<{
        createdAt: Date;
        jobId: string;
        interviewId: string;
        displayOrder: number;
        isMandatory: boolean;
    }[]>;
}
export declare class InterviewAssignmentsRepositories {
    static createInterviewAssignments(assignments: Prisma.InterviewAssignmentCreateManyInput[]): Promise<{
        id: string;
        createdAt: Date;
        application: {
            id: string;
            status: import("@prisma/client").$Enums.ApplicationStatus;
            candidate: {
                fullName: string;
                id: string;
            };
            job: {
                id: string;
                title: string;
            };
        };
        interviewId: string;
        applicationId: string;
        creationSource: import("@prisma/client").$Enums.InterviewAssignmentCreationSource;
    }[]>;
    static findInterviewAssignments(interviewId: string, pagination: PaginationResult): Promise<{
        data: InterviewAssignmentResponse[];
        total: number;
    }>;
    static findInterviewAssignmentById(interviewId: string, assignmentId: string): Promise<InterviewAssignmentDetailResponse | null>;
    static findExistingAssignments(interviewId: string, applicationIds: string[]): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        interviewId: string;
        applicationId: string;
        creationSource: import("@prisma/client").$Enums.InterviewAssignmentCreationSource;
        assignedById: string | null;
    }[]>;
    static deleteInterviewAssignment(assignmentId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        interviewId: string;
        applicationId: string;
        creationSource: import("@prisma/client").$Enums.InterviewAssignmentCreationSource;
        assignedById: string | null;
    }>;
}
export declare class InterviewSessionsRepositories {
    static createSessionWithParticipants(sessionData: Prisma.InterviewSessionUncheckedCreateInput, participants: Prisma.InterviewSessionParticipantUncheckedCreateWithoutSessionInput[]): Promise<InterviewSessionResponse>;
    static findSessionsByInterviewId(interviewId: string): Promise<InterviewSessionResponse[]>;
    static findSessionById(sessionId: string): Promise<InterviewSessionDetailResponse | null>;
    static findSessionWithJobAndAIConfig(sessionId: string): Promise<({
        interview: {
            jobInterviews: ({
                job: {
                    skills: {
                        name: string;
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        jobId: string;
                        isRequired: boolean;
                    }[];
                } & {
                    companyId: string;
                    description: string;
                    slug: string;
                    id: string;
                    status: import("@prisma/client").$Enums.JobStatus;
                    createdAt: Date;
                    updatedAt: Date;
                    visibility: import("@prisma/client").$Enums.JobVisibility;
                    location: string | null;
                    title: string;
                    employmentType: import("@prisma/client").$Enums.EmploymentType;
                    workplaceType: import("@prisma/client").$Enums.WorkplaceType;
                    vacancies: number;
                    minExperience: number;
                    maxExperience: number;
                    minimumSalary: number | null;
                    maximumSalary: number | null;
                    salaryPeriod: import("@prisma/client").$Enums.SalaryPeriod | null;
                    hideSalary: boolean;
                    applicationDeadline: Date | null;
                    workflowId: string | null;
                    summary: string | null;
                    publishedAt: Date | null;
                    closedAt: Date | null;
                    archivedAt: Date | null;
                    createdById: string;
                    updatedById: string | null;
                };
            } & {
                createdAt: Date;
                jobId: string;
                interviewId: string;
                displayOrder: number;
                isMandatory: boolean;
            })[];
            aiConfiguration: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                interviewId: string;
                difficulty: import("@prisma/client").$Enums.QuestionDifficulty;
                systemPrompt: string | null;
                evaluationMetrics: Prisma.JsonValue | null;
                questionCount: number;
                allowFollowUps: boolean;
            } | null;
        } & {
            type: import("@prisma/client").$Enums.InterviewType;
            companyId: string;
            description: string | null;
            id: string;
            status: import("@prisma/client").$Enums.InterviewStatus;
            createdAt: Date;
            updatedAt: Date;
            mode: import("@prisma/client").$Enums.InterviewMode;
            title: string;
            createdById: string;
            instructions: string | null;
            durationMinutes: number | null;
        };
        participants: ({
            assignment: ({
                application: {
                    job: {
                        skills: {
                            name: string;
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            jobId: string;
                            isRequired: boolean;
                        }[];
                    } & {
                        companyId: string;
                        description: string;
                        slug: string;
                        id: string;
                        status: import("@prisma/client").$Enums.JobStatus;
                        createdAt: Date;
                        updatedAt: Date;
                        visibility: import("@prisma/client").$Enums.JobVisibility;
                        location: string | null;
                        title: string;
                        employmentType: import("@prisma/client").$Enums.EmploymentType;
                        workplaceType: import("@prisma/client").$Enums.WorkplaceType;
                        vacancies: number;
                        minExperience: number;
                        maxExperience: number;
                        minimumSalary: number | null;
                        maximumSalary: number | null;
                        salaryPeriod: import("@prisma/client").$Enums.SalaryPeriod | null;
                        hideSalary: boolean;
                        applicationDeadline: Date | null;
                        workflowId: string | null;
                        summary: string | null;
                        publishedAt: Date | null;
                        closedAt: Date | null;
                        archivedAt: Date | null;
                        createdById: string;
                        updatedById: string | null;
                    };
                } & {
                    id: string;
                    status: import("@prisma/client").$Enums.ApplicationStatus;
                    updatedAt: Date;
                    jobId: string;
                    candidateId: string;
                    resumeId: string;
                    coverLetter: string | null;
                    appliedAt: Date;
                    lastStatusUpdatedAt: Date | null;
                    withdrawnAt: Date | null;
                    withdrawReason: string | null;
                    rejectedAt: Date | null;
                    rejectionReason: string | null;
                    hiredAt: Date | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                interviewId: string;
                applicationId: string;
                creationSource: import("@prisma/client").$Enums.InterviewAssignmentCreationSource;
                assignedById: string | null;
            }) | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            joinedAt: Date | null;
            companyMemberId: string | null;
            sessionId: string;
            participantType: import("@prisma/client").$Enums.InterviewParticipantType;
            assignmentId: string | null;
            hasJoined: boolean;
        })[];
        aiQuestions: ({
            answer: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                questionId: string;
                answerText: string;
                recordingUrl: string | null;
                answeredAt: Date;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            question: string;
            skill: string | null;
            difficulty: import("@prisma/client").$Enums.QuestionDifficulty | null;
            sessionId: string;
            sequence: number;
            topic: string | null;
            expectedAreas: Prisma.JsonValue | null;
            parentAIQuestionId: string | null;
        })[];
    } & {
        id: string;
        status: import("@prisma/client").$Enums.InterviewSessionStatus;
        createdAt: Date;
        updatedAt: Date;
        interviewId: string;
        startedAt: Date | null;
        scheduledAt: Date;
        endedAt: Date | null;
        roomId: string | null;
    }) | null>;
    static updateSession(sessionId: string, data: Prisma.InterviewSessionUpdateInput): Promise<InterviewSessionResponse>;
}
export declare class InterviewSessionParticipantsRepositories {
    static addParticipants(participants: Prisma.InterviewSessionParticipantCreateManyInput[]): Promise<InterviewSessionParticipantResponse[]>;
    static findSessionParticipants(sessionId: string): Promise<InterviewSessionParticipantResponse[]>;
    static findParticipantById(participantId: string): Promise<InterviewSessionParticipantResponse | null>;
    static deleteParticipant(participantId: string): Promise<void>;
    static findParticipantForSession(userId: string, sessionId: string): Promise<({
        session: {
            interview: {
                type: import("@prisma/client").$Enums.InterviewType;
                companyId: string;
                description: string | null;
                id: string;
                status: import("@prisma/client").$Enums.InterviewStatus;
                createdAt: Date;
                updatedAt: Date;
                mode: import("@prisma/client").$Enums.InterviewMode;
                title: string;
                createdById: string;
                instructions: string | null;
                durationMinutes: number | null;
            };
        } & {
            id: string;
            status: import("@prisma/client").$Enums.InterviewSessionStatus;
            createdAt: Date;
            updatedAt: Date;
            interviewId: string;
            startedAt: Date | null;
            scheduledAt: Date;
            endedAt: Date | null;
            roomId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        joinedAt: Date | null;
        companyMemberId: string | null;
        sessionId: string;
        participantType: import("@prisma/client").$Enums.InterviewParticipantType;
        assignmentId: string | null;
        hasJoined: boolean;
    }) | null>;
    static updateParticipantJoinedStatus(participantId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        joinedAt: Date | null;
        companyMemberId: string | null;
        sessionId: string;
        participantType: import("@prisma/client").$Enums.InterviewParticipantType;
        assignmentId: string | null;
        hasJoined: boolean;
    }>;
}
//# sourceMappingURL=interviews.repository.d.ts.map