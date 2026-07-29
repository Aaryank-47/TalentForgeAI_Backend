import prisma from "../../../config/database.js";
export class ApplicationWorkflowRepository {
    static async getWorkflowStageById(workflowStageId) {
        return prisma.workflowStage.findUnique({
            where: {
                id: workflowStageId
            }
        });
    }
    static async getApplicationWorkflowByApplicationId(applicationId) {
        return prisma.applicationWorkflow.findUnique({
            where: {
                applicationId
            }
        });
    }
    static async createApplicationWorkflow(data) {
        return prisma.$transaction(async (tx) => {
            const appWorkflow = await tx.applicationWorkflow.create({
                data: {
                    applicationId: data.applicationId,
                    workflowStageId: data.workflowStageId,
                }
            });
            await tx.workflowHistory.create({
                data: {
                    applicationWorkflowId: appWorkflow.id,
                    fromStageId: null,
                    toStageId: data.workflowStageId,
                    movedByEmployerId: data.movedByEmployerId ?? null,
                    comment: data.comment ?? "Initial application stage assignment",
                }
            });
            return appWorkflow;
        });
    }
    static async getFirstWorkflowStage(workflowId) {
        return prisma.workflowStage.findFirst({
            where: {
                workflowId
            },
            orderBy: {
                order: "asc"
            }
        });
    }
    static async findEmployerByUserId(userId) {
        return prisma.employer.findUnique({
            where: {
                userId
            }
        });
    }
    static async getDefaultWorkflowStageForCompany(companyId) {
        let workflow = await prisma.workflow.findFirst({
            where: {
                companyId,
                isDefault: true
            },
            include: {
                stages: {
                    orderBy: {
                        order: "asc"
                    }
                }
            }
        });
        if (!workflow) {
            workflow = await prisma.workflow.findFirst({
                where: {
                    companyId,
                    status: "ACTIVE"
                },
                include: {
                    stages: {
                        orderBy: {
                            order: "asc"
                        }
                    }
                }
            });
        }
        return workflow?.stages[0] || null;
    }
}
//# sourceMappingURL=application-workflow.repository.js.map