import prisma from "../../../config/database.js";
import { AttemptStatus, InvitationStatus } from "@prisma/client";

export class AssessmentAttemptRepository {
    static async findCandidateByUserId(userId: string) {
        return await prisma.candidate.findUnique({
            where: { userId }
        });
    }

    static async findInvitationByToken(token: string) {
        return await prisma.assessmentInvitation.findUnique({
            where: { token },
            include: {
                assessment: {
                    select: {
                        id: true,
                        title: true,
                        durationMinutes: true,
                        companyId: true,
                        status: true,
                        deletedAt: true
                    }
                },
                application: {
                    include: {
                        candidate: {
                            select: {
                                id: true,
                                userId: true,
                                fullName: true
                            }
                        },
                        assessmentAttempts: {
                            orderBy: {
                                createdAt: "desc"
                            }
                        }
                    }
                }
            }
        });
    }

    static async updateInvitationStatus(id: string, status: InvitationStatus) {
        return await prisma.assessmentInvitation.update({
            where: { id },
            data: { status }
        });
    }

    static async createAssessmentAttempt(data: any) {
        return await prisma.assessmentAttempt.create({
            data
        });
    }

    static async findAttemptById(id: string) {
        return await prisma.assessmentAttempt.findUnique({
            where: { id },
            include: {
                candidate: {
                    select: {
                        userId: true
                    }
                },
                assessment: {
                    select: {
                        id: true,
                        title: true,
                        companyId: true,
                        durationMinutes: true,
                        status: true,
                        description: true,
                        instructions: true
                    }
                }
            }
        });
    }

    static async findAttemptsByCandidate(candidateId: string, filters: { status?: any }, skip: number, limit: number) {
        const where: any = { candidateId };
        if (filters.status) {
            where.status = filters.status;
        }
        return await prisma.assessmentAttempt.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                assessment: {
                    select: {
                        title: true,
                        durationMinutes: true
                    }
                }
            }
        });
    }

    static async countAttemptsByCandidate(
        candidateId: string, 
        filters: { 
            status?: AttemptStatus 
        }) {
        const where: any = { candidateId };
        if (filters.status) {
            where.status = filters.status;
        }
        return await prisma.assessmentAttempt.count({ where });
    }

    static async findInvitationByApplicationAndAssessment(applicationId: string, assessmentId: string) {
        return await prisma.assessmentInvitation.findFirst({
            where: { applicationId, assessmentId }
        });
    }

    static async updateAttemptStatus(
        id: string, 
        status: AttemptStatus, 
        submittedAt?: Date
    ) {
        return await prisma.assessmentAttempt.update({
            where: { id },
            data: {
                status,
                ...(submittedAt ? { submittedAt } : {})
            }
        });
    }

    static async checkActiveCompanyMember(
        userId: string, 
        companyId: string
    ) {
        return await prisma.companyMember.findFirst({
            where: {
                userId,
                companyId,
                status: "ACTIVE"
            }
        });
    }
}
