import prisma from "../../../config/database.js";
import { interviewSelect, interviewListSelect, interviewDetailSelect, jobInterviewWithInterviewSelect, interviewAssignmentSelect, interviewAssignmentDetailSelect, interviewSessionSelect, interviewSessionDetailSelect, interviewSessionParticipantSelect } from "../interfaces/interviews.interface.js";
export class InterviewsRepositories {
    static async createInterview(data) {
        return prisma.interview.create({
            data,
            select: interviewSelect
        });
    }
    static async getCompanyInterviews(companyId, pagination, filters) {
        const where = {
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
    static async getInterviewById(companyId, interviewId) {
        return prisma.interview.findUnique({
            where: {
                id: interviewId,
                companyId
            },
            select: interviewDetailSelect
        });
    }
    static async updateInterview(companyId, interviewId, data) {
        return prisma.interview.update({
            where: {
                id: interviewId,
                companyId
            },
            data,
            select: interviewSelect
        });
    }
    static async changeInterviewStatus(companyId, interviewId, status) {
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
    static async deleteInterview(companyId, interviewId) {
        return prisma.interview.delete({
            where: {
                id: interviewId,
                companyId
            }
        });
    }
}
export class JobInterviewsRepositories {
    static async createJobInterview(data) {
        return prisma.jobInterview.create({
            data
        });
    }
    static async findJobInterviews(jobId) {
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
    static async findJobInterview(jobId, interviewId) {
        return prisma.jobInterview.findUnique({
            where: {
                jobId_interviewId: {
                    jobId,
                    interviewId
                }
            }
        });
    }
    static async findLastJobInterview(jobId) {
        return prisma.jobInterview.findFirst({
            where: { jobId },
            orderBy: { displayOrder: 'desc' }
        });
    }
    static async deleteJobInterview(jobId, interviewId) {
        return prisma.jobInterview.delete({
            where: {
                jobId_interviewId: {
                    jobId,
                    interviewId
                }
            }
        });
    }
    static async deleteAllJobInterviewsByInterviewId(interviewId) {
        return prisma.jobInterview.deleteMany({
            where: {
                interviewId
            }
        });
    }
    static async updateJobInterviewOrders(jobId, orders) {
        return prisma.$transaction(orders.map(order => prisma.jobInterview.update({
            where: {
                jobId_interviewId: {
                    jobId,
                    interviewId: order.interviewId
                }
            },
            data: {
                displayOrder: order.displayOrder
            }
        })));
    }
}
export class InterviewAssignmentsRepositories {
    static async createInterviewAssignments(assignments) {
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
    static async findInterviewAssignments(interviewId, pagination) {
        const where = {
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
        return { data: data, total };
    }
    static async findInterviewAssignmentById(interviewId, assignmentId) {
        return prisma.interviewAssignment.findUnique({
            where: {
                id: assignmentId,
                interviewId
            },
            select: interviewAssignmentDetailSelect
        });
    }
    static async findExistingAssignments(interviewId, applicationIds) {
        return prisma.interviewAssignment.findMany({
            where: {
                interviewId,
                applicationId: { in: applicationIds }
            }
        });
    }
    static async deleteInterviewAssignment(assignmentId) {
        return prisma.interviewAssignment.delete({
            where: {
                id: assignmentId
            }
        });
    }
}
export class InterviewSessionsRepositories {
    static async createSessionWithParticipants(sessionData, participants) {
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
    static async findSessionsByInterviewId(interviewId) {
        return prisma.interviewSession.findMany({
            where: { interviewId },
            orderBy: { scheduledAt: 'asc' },
            select: interviewSessionSelect
        });
    }
    static async findSessionById(sessionId) {
        return prisma.interviewSession.findUnique({
            where: { id: sessionId },
            select: interviewSessionDetailSelect
        });
    }
    static async findSessionWithJobAndAIConfig(sessionId) {
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
    static async updateSession(sessionId, data) {
        return prisma.interviewSession.update({
            where: { id: sessionId },
            data,
            select: interviewSessionSelect
        });
    }
}
export class InterviewSessionParticipantsRepositories {
    static async addParticipants(participants) {
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
    static async findSessionParticipants(sessionId) {
        return prisma.interviewSessionParticipant.findMany({
            where: { sessionId },
            select: interviewSessionParticipantSelect
        });
    }
    static async findParticipantById(participantId) {
        return prisma.interviewSessionParticipant.findUnique({
            where: { id: participantId },
            select: interviewSessionParticipantSelect
        });
    }
    static async deleteParticipant(participantId) {
        await prisma.interviewSessionParticipant.delete({
            where: { id: participantId }
        });
    }
    static async findParticipantForSession(userId, sessionId) {
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
    static async updateParticipantJoinedStatus(participantId) {
        return prisma.interviewSessionParticipant.update({
            where: { id: participantId },
            data: {
                hasJoined: true,
                joinedAt: new Date()
            }
        });
    }
}
//# sourceMappingURL=interviews.repository.js.map