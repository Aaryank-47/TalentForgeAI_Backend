import prisma from "../../../config/database.js";

export class ApplicationWorkflowRepository{
    static async getWorkflowStageById(
        workflowStageId: string
    ){
        return prisma.workflowStage.findUnique({
            where: {
                id: workflowStageId
            }
        })
    }

    static async getApplicationWorkflowByApplicationId(
        applicationId: string
    ){
        return prisma.applicationWorkflow.findUnique({
            where: {
                applicationId
            }
        })
    }

    static async createApplicationWorkflow(
        data: {
            applicationId: string;
            workflowStageId: string;
            movedByEmployerId?: string;
            comment?: string;
        }
    ){
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

    static async getFirstWorkflowStage(
        workflowId: string
    ){
        return prisma.workflowStage.findFirst({
            where: {
                workflowId
            },
            orderBy: {
                order: "asc"
            }
        })
    }

    static async findEmployerByUserId(userId: string) {
        return prisma.employer.findUnique({
            where: {
                userId
            }
        });
    }

    static async getDefaultWorkflowStageForCompany(companyId: string) {
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