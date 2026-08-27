import prisma from "../../../config/database.js";
import { AttemptStatus, EvaluationStatus } from "@prisma/client";
export class ATSIntegrationRepository {
    static async findApplicationById(id) {
        return await prisma.application.findUnique({
            where: { id },
            include: {
                candidate: {
                    select: {
                        userId: true
                    }
                },
                job: {
                    select: {
                        companyId: true,
                        workflowId: true
                    }
                }
            }
        });
    }
    static async findCompletedAttemptByApplication(applicationId) {
        return await prisma.assessmentAttempt.findFirst({
            where: {
                applicationId,
                status: { in: [AttemptStatus.SUBMITTED, AttemptStatus.IN_PROGRESS] }
            },
            include: {
                assessment: {
                    select: {
                        id: true,
                        title: true,
                        totalMarks: true,
                        passingScore: true,
                        durationMinutes: true,
                        sections: {
                            include: {
                                items: {
                                    include: {
                                        question: {
                                            include: {
                                                mcqDetail: {
                                                    include: {
                                                        options: true
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                answers: {
                    include: {
                        question: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });
    }
    static async findAttemptWithAssessmentAndApplication(attemptId) {
        return await prisma.assessmentAttempt.findUnique({
            where: { id: attemptId },
            include: {
                assessment: true,
                application: {
                    include: {
                        job: {
                            include: {
                                company: true
                            }
                        },
                        candidate: {
                            include: {
                                user: true
                            }
                        }
                    }
                }
            }
        });
    }
    static async findWorkflowStagesOrdered(workflowId) {
        return await prisma.workflowStage.findMany({
            where: { workflowId },
            include: {
                stageLibrary: true
            },
            orderBy: {
                order: "asc"
            }
        });
    }
    static async findApplicationWorkflow(applicationId) {
        return await prisma.applicationWorkflow.findUnique({
            where: { applicationId }
        });
    }
    static async findActiveCompanyMember(userId, companyId) {
        return await prisma.companyMember.findFirst({
            where: {
                userId,
                companyId,
                status: "ACTIVE"
            }
        });
    }
}
//# sourceMappingURL=atsIntegration.repository.js.map