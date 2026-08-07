import prisma from "../../../config/database.js";

export class AssessmentAttemptRepository {
    static async findInvitationByToken(token: string) {
        return await prisma.assessmentInvitation.findUnique({
            where: { token },
            include: {
                assessment: {
                    select: {
                        id: true,
                        title: true,
                        durationMinutes: true,
                        companyId: true
                    }
                },
                application: {
                    include: {
                        candidate: {
                            select: {
                                fullName: true
                            }
                        },
                        assessmentAttempts: {
                            orderBy: {
                                createdAt: "desc"
                            },
                            take: 1
                        }
                    }
                }
            }
        });
    }

    static async updateInvitationStatus(id: string, status: any) {
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
}
