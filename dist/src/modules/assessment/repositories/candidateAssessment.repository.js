import prisma from "../../../config/database.js";
import { AttemptStatus, InvitationStatus } from "@prisma/client";
export class AssessmentAttemptRepository {
    static async findCandidateByUserId(userId) {
        return await prisma.candidate.findUnique({
            where: { userId }
        });
    }
    static async findInvitationByToken(token) {
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
    static async updateInvitationStatus(id, status) {
        return await prisma.assessmentInvitation.update({
            where: { id },
            data: { status }
        });
    }
    static async createAssessmentAttempt(data) {
        return await prisma.assessmentAttempt.create({
            data
        });
    }
    static async findAttemptById(id) {
        return await prisma.assessmentAttempt.findUnique({
            where: { id },
            include: {
                candidate: {
                    select: {
                        userId: true
                    }
                },
                assessment: {
                    include: {
                        sections: {
                            orderBy: { displayOrder: "asc" },
                            include: {
                                items: {
                                    orderBy: { displayOrder: "asc" },
                                    include: {
                                        question: {
                                            include: {
                                                mcqDetail: {
                                                    include: {
                                                        options: {
                                                            orderBy: { displayOrder: "asc" },
                                                            select: {
                                                                id: true,
                                                                optionText: true,
                                                                displayOrder: true
                                                            }
                                                        }
                                                    }
                                                },
                                                dsaDetail: {
                                                    include: {
                                                        testCases: {
                                                            where: { type: "SAMPLE" }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    }
    static async findAttemptsByCandidate(candidateId, filters, skip, limit) {
        const where = { candidateId };
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
    static async countAttemptsByCandidate(candidateId, filters) {
        const where = { candidateId };
        if (filters.status) {
            where.status = filters.status;
        }
        return await prisma.assessmentAttempt.count({ where });
    }
    static async findInvitationByApplicationAndAssessment(applicationId, assessmentId) {
        return await prisma.assessmentInvitation.findFirst({
            where: { applicationId, assessmentId }
        });
    }
    static async updateAttemptStatus(id, status, submittedAt) {
        return await prisma.assessmentAttempt.update({
            where: { id },
            data: {
                status,
                ...(submittedAt ? { submittedAt } : {})
            }
        });
    }
    static async checkActiveCompanyMember(userId, companyId) {
        return await prisma.companyMember.findFirst({
            where: {
                userId,
                companyId,
                status: "ACTIVE"
            }
        });
    }
    static async findQuestionInSectionItem(assessmentId, questionId) {
        return await prisma.assessmentSectionItem.findFirst({
            where: {
                questionId,
                section: {
                    assessmentId
                }
            }
        });
    }
    static async findQuestionWithDetails(id) {
        return await prisma.question.findUnique({
            where: { id },
            include: {
                mcqDetail: {
                    include: {
                        options: true
                    }
                },
                dsaDetail: {
                    include: {
                        supportedLanguages: {
                            include: {
                                programmingLanguage: true
                            }
                        }
                    }
                },
                projectDetail: true,
                machineCodingDetail: true
            }
        });
    }
    static async findAnswerByAttemptAndQuestion(attemptId, questionId) {
        return await prisma.assessmentAnswer.findUnique({
            where: {
                attemptId_questionId: {
                    attemptId,
                    questionId
                }
            }
        });
    }
    static async createAnswer(data) {
        return await prisma.assessmentAnswer.create({
            data
        });
    }
    static async upsertAnswer(attemptId, questionId, data) {
        return await prisma.assessmentAnswer.upsert({
            where: {
                attemptId_questionId: {
                    attemptId,
                    questionId
                }
            },
            create: {
                attemptId,
                questionId,
                startedAt: new Date(),
                selectedOptionIds: data.selectedOptionIds ?? [],
                attachmentUrls: data.attachmentUrls ?? [],
                codeResponse: data.codeResponse ?? null,
                submissionUrl: data.submissionUrl ?? null,
                meta: data.meta ?? null
            },
            update: {
                selectedOptionIds: data.selectedOptionIds ?? [],
                attachmentUrls: data.attachmentUrls ?? [],
                codeResponse: data.codeResponse ?? null,
                submissionUrl: data.submissionUrl ?? null,
                meta: data.meta ?? null
            }
        });
    }
    static async findAnswersByAttempt(attemptId) {
        return await prisma.assessmentAnswer.findMany({
            where: { attemptId },
            orderBy: { startedAt: "asc" }
        });
    }
    static async deleteAnswer(attemptId, questionId) {
        return await prisma.assessmentAnswer.delete({
            where: {
                attemptId_questionId: {
                    attemptId,
                    questionId
                }
            }
        });
    }
}
//# sourceMappingURL=candidateAssessment.repository.js.map