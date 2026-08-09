import prisma from "../../../config/database.js";
import { AttemptStatus, EvaluationStatus } from "@prisma/client";

export class ATSIntegrationRepository {
    static async findApplicationById(id: string) {
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

    static async findCompletedAttemptByApplication(applicationId: string) {
        return await prisma.assessmentAttempt.findFirst({
            where: {
                applicationId,
                status: AttemptStatus.SUBMITTED,
                evaluationStatus: EvaluationStatus.COMPLETED
            },
            include: {
                assessment: {
                    select: {
                        title: true
                    }
                }
            },
            orderBy: {
                submittedAt: "desc"
            }
        });
    }

    static async findAttemptWithAssessmentAndApplication(attemptId: string) {
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

    static async findWorkflowStagesOrdered(workflowId: string) {
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

    static async findApplicationWorkflow(applicationId: string) {
        return await prisma.applicationWorkflow.findUnique({
            where: { applicationId }
        });
    }

    static async findActiveCompanyMember(userId: string, companyId: string) {
        return await prisma.companyMember.findFirst({
            where: {
                userId,
                companyId,
                status: "ACTIVE"
            }
        });
    }
}
