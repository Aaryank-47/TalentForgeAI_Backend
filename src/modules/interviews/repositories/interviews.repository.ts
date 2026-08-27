import type { CreateInterviewDto } from "../dto/interviews.dto.js";
import prisma from "../../../config/database.js";
import type { Prisma, InterviewStatus } from "@prisma/client";
import {
    interviewSelect,
    type InterviewResponse,
    interviewListSelect,
    type InterviewSummary,
    interviewDetailSelect,
    type InterviewDetailPayload,
    type CreateJobInterviewData,
    type JobInterviewWithInterviewPayload,
    jobInterviewWithInterviewSelect,
    interviewAssignmentSelect,
    interviewAssignmentDetailSelect,
    type InterviewAssignmentResponse,
    type InterviewAssignmentDetailResponse,
    interviewSessionSelect,
    type InterviewSessionResponse,
    interviewSessionDetailSelect,
    type InterviewSessionDetailResponse,
    interviewSessionParticipantSelect,
    type InterviewSessionParticipantResponse
} from "../interfaces/interviews.interface.js";
import type { PaginationResult } from "../../../common/types/pagination.types.js";

export class InterviewsRepositories {
    static async createInterview(data: Prisma.InterviewCreateInput): Promise<InterviewResponse> {
        return prisma.interview.create({
            data,
            select: interviewSelect
        });
    }

    static async getCompanyInterviews(
        companyId: string,
        pagination: PaginationResult,
        filters: {
            status?: any,
            type?: any,
            mode?: any,
            search?: string
        }
    ): Promise<{
        data: InterviewSummary[],
        total: number
    }> {
        const where: Prisma.InterviewWhereInput = {
            companyId,
            ...(filters.status && { status: filters.status }),
            ...(filters.type && { type: filters.type }),
            ...(filters.mode && { mode: filters.mode }),
            ...(filters.search && {
                title: { contains: filters.search, mode: "insensitive" }
            })
        };

        const [data, total] = await Promise.all([
            prisma.interview.findMany({
                where,
                skip: pagination.skip,
                take: pagination.take,
                orderBy: { [pagination.sortBy]: pagination.sortOrder },
                select: interviewListSelect
            }),
            prisma.interview.count({ where })
        ]);

        return { data, total };
    }

    static async getInterviewById(companyId: string, interviewId: string): Promise<InterviewDetailPayload | null> {
        return prisma.interview.findUnique({
            where: {
                id: interviewId,
                companyId
            },
            select: interviewDetailSelect
        });
    }

    static async updateInterview(
        companyId: string,
        interviewId: string,
        data: Prisma.InterviewUpdateInput
    ): Promise<InterviewResponse> {
        return prisma.interview.update({
            where: {
                id: interviewId,
                companyId
            },
            data,
            select: interviewSelect
        });
    }

    static async changeInterviewStatus(
        companyId: string,
        interviewId: string,
        status: InterviewStatus
    ) {
        return prisma.interview.update({
            where: {
                id: interviewId,
                companyId
            },
            data: {
                status
            },
            select: {
                id: true,
                status: true
            }
        });
    }

    static async deleteInterview(companyId: string, interviewId: string) {
        return prisma.interview.delete({
            where: {
                id: interviewId,
                companyId
            }
        });
    }
}

export class JobInterviewsRepositories {
    static async createJobInterview(data: CreateJobInterviewData) {
        return prisma.jobInterview.create({
            data
        });
    }

    static async findJobInterviews(jobId: string): Promise<JobInterviewWithInterviewPayload[]> {
        return prisma.jobInterview.findMany({
            where: { jobId },
            orderBy: { displayOrder: 'asc' },
            select: jobInterviewWithInterviewSelect
        });
    }

    static async findAllJobInterviews() {
        return prisma.jobInterview.findMany({
            include: { interview: true }
        });
    }

    static async findJobInterview(jobId: string, interviewId: string) {
        return prisma.jobInterview.findUnique({
            where: {
                jobId_interviewId: {
                    jobId,
                    interviewId
                }
            }
        });
    }

    static async findLastJobInterview(jobId: string) {
        return prisma.jobInterview.findFirst({
            where: { jobId },
            orderBy: { displayOrder: 'desc' }
        });
    }

    static async deleteJobInterview(jobId: string, interviewId: string) {
        return prisma.jobInterview.delete({
            where: {
                jobId_interviewId: {
                    jobId,
                    interviewId
                }
            }
        });
    }

    static async deleteAllJobInterviewsByInterviewId(interviewId: string) {
        return prisma.jobInterview.deleteMany({
            where: {
                interviewId
            }
        });
    }

    static async updateJobInterviewOrders(
        jobId: string,
        orders: { interviewId: string; displayOrder: number }[]
    ) {
        return prisma.$transaction(
            orders.map(order =>
                prisma.jobInterview.update({
                    where: {
                        jobId_interviewId: {
                            jobId,
                            interviewId: order.interviewId
                        }
                    },
                    data: {
                        displayOrder: order.displayOrder
                    }
                })
            )
        );
    }
}

export class InterviewAssignmentsRepositories {
    static async createInterviewAssignments(
        assignments: Prisma.InterviewAssignmentCreateManyInput[]
    ) {
        return prisma.$transaction(async (tx) => {
            await tx.interviewAssignment.createMany({
                data: assignments
            });

            // Return the created assignments by looking them up
            return tx.interviewAssignment.findMany({
                where: {
                    OR: assignments.map(a => ({
                        interviewId: a.interviewId,
                        applicationId: a.applicationId
                    }))
                },
                select: interviewAssignmentSelect
            });
        });
    }

    static async findInterviewAssignments(
        interviewId: string,
        pagination: PaginationResult
    ): Promise<{ data: InterviewAssignmentResponse[], total: number }> {
        const where: Prisma.InterviewAssignmentWhereInput = {
            interviewId
        };

        const [data, total] = await Promise.all([
            prisma.interviewAssignment.findMany({
                where,
                skip: pagination.skip,
                take: pagination.take,
                orderBy: { [pagination.sortBy]: pagination.sortOrder },
                select: interviewAssignmentSelect
            }),
            prisma.interviewAssignment.count({ where })
        ]);

        return { data: data as InterviewAssignmentResponse[], total };
    }

    static async findInterviewAssignmentById(
        interviewId: string,
        assignmentId: string
    ): Promise<InterviewAssignmentDetailResponse | null> {
        return prisma.interviewAssignment.findUnique({
            where: {
                id: assignmentId,
                interviewId
            },
            select: interviewAssignmentDetailSelect
        }) as Promise<InterviewAssignmentDetailResponse | null>;
    }

    static async findExistingAssignments(
        interviewId: string,
        applicationIds: string[]
    ) {
        return prisma.interviewAssignment.findMany({
            where: {
                interviewId,
                applicationId: { in: applicationIds }
            }
        });
    }

    static async deleteInterviewAssignment(assignmentId: string) {
        return prisma.interviewAssignment.delete({
            where: {
                id: assignmentId
            }
        });
    }
}

export class InterviewSessionsRepositories {
    static async createSessionWithParticipants(
        sessionData: Prisma.InterviewSessionUncheckedCreateInput,
        participants: Prisma.InterviewSessionParticipantUncheckedCreateWithoutSessionInput[]
    ): Promise<InterviewSessionResponse> {
        return prisma.$transaction(async (tx) => {
            const session = await tx.interviewSession.create({
                data: {
                    ...sessionData,
                    participants: {
                        create: participants
                    }
                },
                select: interviewSessionSelect
            });

            return session;
        });
    }

    static async findSessionsByInterviewId(interviewId: string): Promise<InterviewSessionResponse[]> {
        return prisma.interviewSession.findMany({
            where: { interviewId },
            orderBy: { scheduledAt: 'asc' },
            select: interviewSessionSelect
        });
    }

    static async findSessionById(sessionId: string): Promise<InterviewSessionDetailResponse | null> {
        return prisma.interviewSession.findUnique({
            where: { id: sessionId },
            select: interviewSessionDetailSelect
        }) as Promise<InterviewSessionDetailResponse | null>;
    }

    static async findSessionWithJobAndAIConfig(sessionId: string) {
        return prisma.interviewSession.findUnique({
            where: { id: sessionId },
            include: {
                aiQuestions: {
                    include: {
                        answer: true
                    }
                },
                participants: {
                    include: {
                        assignment: {
                            include: {
                                application: {
                                    include: {
                                        job: {
                                            include: {
                                                skills: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                interview: {
                    include: {
                        aiConfiguration: true,
                        jobInterviews: {
                            include: {
                                job: {
                                    include: {
                                        skills: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    static async updateSession(
        sessionId: string,
        data: Prisma.InterviewSessionUpdateInput
    ): Promise<InterviewSessionResponse> {
        return prisma.interviewSession.update({
            where: { id: sessionId },
            data,
            select: interviewSessionSelect
        });
    }
}

export class InterviewSessionParticipantsRepositories {
    static async addParticipants(
        participants: Prisma.InterviewSessionParticipantCreateManyInput[]
    ): Promise<InterviewSessionParticipantResponse[]> {
        return prisma.$transaction(async (tx) => {
            await tx.interviewSessionParticipant.createMany({
                data: participants
            });

            return tx.interviewSessionParticipant.findMany({
                where: {
                    OR: participants.map(p => ({
                        sessionId: p.sessionId,
                        ...(p.assignmentId ? { assignmentId: p.assignmentId } : {}),
                        ...(p.companyMemberId ? { companyMemberId: p.companyMemberId } : {})
                    }))
                },
                select: interviewSessionParticipantSelect
            });
        });
    }

    static async findSessionParticipants(sessionId: string): Promise<InterviewSessionParticipantResponse[]> {
        return prisma.interviewSessionParticipant.findMany({
            where: { sessionId },
            select: interviewSessionParticipantSelect
        });
    }

    static async findParticipantById(participantId: string): Promise<InterviewSessionParticipantResponse | null> {
        return prisma.interviewSessionParticipant.findUnique({
            where: { id: participantId },
            select: interviewSessionParticipantSelect
        });
    }

    static async deleteParticipant(participantId: string): Promise<void> {
        await prisma.interviewSessionParticipant.delete({
            where: { id: participantId }
        });
    }

    static async findParticipantForSession(userId: string, sessionId: string) {
        return prisma.interviewSessionParticipant.findFirst({
            where: {
                sessionId,
                OR: [
                    { assignment: { application: { candidate: { userId } } } },
                    { companyMember: { userId } }
                ]
            },
            include: {
                session: {
                    include: {
                        interview: true
                    }
                }
            }
        });
    }

    static async updateParticipantJoinedStatus(participantId: string) {
        return prisma.interviewSessionParticipant.update({
            where: { id: participantId },
            data: {
                hasJoined: true,
                joinedAt: new Date()
            }
        });
    }
}
