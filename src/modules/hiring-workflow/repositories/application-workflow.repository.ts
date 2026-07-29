import prisma from "../../../config/database.js";
import type { ApplicationWorkflow } from "@prisma/client";

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

    static async updateApplicationWorkflow(
        movedByEmployerId:string,
        applicationId:string,
        fromStageId:string,
        toStageId:string,
        comment?:string,
        assignedTo?:string
    ): Promise<ApplicationWorkflow> {
        return prisma.$transaction(async (tx) => {
            const appWorkflow = await tx.applicationWorkflow.update({
                where: {
                    applicationId
                },
                data: {
                    workflowStageId: toStageId,
                    assignedEmployerId: assignedTo? assignedTo : null,
                    remarks: comment? comment : null,
                    movedAt: new Date(),
                    updatedAt: new Date()
                }
            });

            await tx.workflowHistory.create({
                data: {
                    applicationWorkflowId: appWorkflow.id,
                    fromStageId: fromStageId ? fromStageId : null,
                    toStageId,
                    movedByEmployerId : movedByEmployerId ? movedByEmployerId : null,
                    comment : comment ? comment : null
                }
            });

            return appWorkflow;
        });
    }

    static async bulkUpdateApplicationWorkflows(
        data: {
            movedByEmployerId: string;
            toStageId: string;
            comment?: string;
            assignedTo?: string;
            // Each item: applicationId + its current (fromStage) workflowStageId + the applicationWorkflow.id
            items: Array<{
                applicationId: string;
                fromStageId: string;
                applicationWorkflowId: string;
            }>;
        }
    ): Promise<ApplicationWorkflow[]> {
        return prisma.$transaction(async (tx) => {
            const now = new Date();

            // 1. Batch-update all ApplicationWorkflow rows in one query
            await tx.applicationWorkflow.updateMany({
                where: {
                    applicationId: { in: data.items.map((i) => i.applicationId) }
                },
                data: {
                    workflowStageId: data.toStageId,
                    assignedEmployerId: data.assignedTo ?? null,
                    remarks: data.comment ?? null,
                    movedAt: now,
                    updatedAt: now
                }
            });

            // 2. Batch-insert all WorkflowHistory rows in one query
            await tx.workflowHistory.createMany({
                data: data.items.map((item) => ({
                    applicationWorkflowId: item.applicationWorkflowId,
                    fromStageId: item.fromStageId,
                    toStageId: data.toStageId,
                    movedByEmployerId: data.movedByEmployerId,
                    comment: data.comment ?? null
                }))
            });

            // 3. Return the updated records in one batch read
            return tx.applicationWorkflow.findMany({
                where: {
                    applicationId: { in: data.items.map((i) => i.applicationId) }
                }
            });
        });
    }

    static async getApplicationWorkflowsByApplicationIds(
        applicationIds: string[]
    ): Promise<ApplicationWorkflow[]> {
        return prisma.applicationWorkflow.findMany({
            where: {
                applicationId: { in: applicationIds }
            }
        });
    }

    static async getApplicationWorkflowWithStages(applicationId: string): Promise<any> {
        return prisma.applicationWorkflow.findUnique({
            where: { applicationId },
            include: {
                application: {
                    include: {
                        job: {
                            include: {
                                workflow: {
                                    include: {
                                        stages: {
                                            include: {
                                                stageLibrary: true
                                            },
                                            orderBy: {
                                                order: "asc"
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

    static async getWorkflowHistoryByWorkflowId(applicationWorkflowId: string): Promise<any[]> {
        return prisma.workflowHistory.findMany({
            where: { applicationWorkflowId },
            include: {
                toStage: {
                    include: {
                        stageLibrary: true
                    }
                },
                movedBy: true
            },
            orderBy: {
                createdAt: "asc"
            }
        });
    }
}