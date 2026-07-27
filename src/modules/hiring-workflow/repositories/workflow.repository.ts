import prisma from "../../../config/database.js"
import { StageType, WorkflowStatus } from "@prisma/client"
import { ConflictError } from "../../../common/errors/ConflictError.js"
import type { CreateWorkflowView, GetWorkflowDetailsByIdView, CompanyWorkflowView } from "../interfaces/hiring-workflow.interface.js"

export class WorkflowRepository {
    static async findWorkflowNameExistingInCompany(
        name: string,
        companyId: string
    ): Promise<any> {
        return await prisma.workflow.findUnique({
            where: {
                companyId_name: {
                    companyId: companyId,
                    name: name
                }
            }
        })
    }

    static async createWorkflow(
        name: string,
        description: string,
        stages: string[],
        companyId: string,
        status: WorkflowStatus
    ): Promise<CreateWorkflowView> {
        return prisma.$transaction(
            async (tx) => {
                const workflowStagesData = []
                let order = 1

                for (const stage of stages) {
                    const stageLib = await tx.stageLibrary.findFirst({
                        where: { name: stage }
                    })
                    let finalStageLib;

                    if (stageLib) {
                        if (stageLib.type === StageType.CUSTOM) {
                            if (stageLib.companyId !== companyId) {
                                throw new ConflictError(
                                    `Conflict: Stage '${stage}' exists but is not associated with this company.`
                                )
                            }
                        }
                        finalStageLib = stageLib;
                    } else {
                        finalStageLib = await tx.stageLibrary.create({
                            data: {
                                name: stage,
                                type: StageType.CUSTOM,
                                companyId: companyId,
                            }
                        })
                    }

                    workflowStagesData.push({
                        stageLibraryId: finalStageLib.id,
                        order: order++
                    })
                }

                return await tx.workflow.create({
                    data: {
                        name: name,
                        description: description,
                        companyId: companyId,
                        stages: {
                            create: workflowStagesData
                        },
                        status: status
                    }
                })
            }
        )
    }

    static async getWorkflowsByCompanyId(
        companyId: string,
        status: WorkflowStatus
    ): Promise<CompanyWorkflowView[]> {
        return await prisma.workflow.findMany({
            where: {
                companyId: companyId,
                status: status
            },
            select: {
                id: true,
                name: true,
                description: true,
                status: true,
                stages: {
                    select: {
                        id: true,
                        workflowId: true,
                        stageLibraryId: true,
                        order: true,
                        stageLibrary: {
                            select: {
                                id: true,
                                name: true,
                                type: true
                            }
                        }
                    },
                    orderBy: {
                        order: "asc"
                    }
                }
            }
        })
    }

    static async getWorkflowById(workflowId : string): Promise<any> {
        return await prisma.workflow.findUnique({
            where : {
                id : workflowId
            }
        })
    }

    static async getWorkflowDetails(
        workflowId : string
    ): Promise<GetWorkflowDetailsByIdView | null> {
        return await prisma.workflow.findUnique({
            where : {
                id : workflowId
            },
            select : {
                id : true,
                companyId : true,
                name : true,
                description : true,
                status : true,
                createdAt : true,
                updatedAt : true,
                stages : {
                    select : {
                        id : true,
                        workflowId : true,
                        stageLibraryId : true,
                        order : true,
                        stageLibrary : {
                            select : {
                                id : true,
                                name : true,
                                type : true
                            }
                        }
                    },
                    orderBy: {
                        order: "asc"
                    }
                }
            }
        })
    }

    static async updateWorkflow(
        workflowId: string,
        name: string,
        description: string | undefined,
        isDefault: boolean,
        stages: { stageLibraryId: string; order: number }[],
        companyId: string
    ): Promise<GetWorkflowDetailsByIdView | null> {
        return await prisma.$transaction(async (tx) => {
            if (isDefault) {
                await tx.workflow.updateMany({
                    where: { companyId, isDefault: true },
                    data: { isDefault: false }
                });
            }

            await tx.workflow.update({
                where: { id: workflowId },
                data: {
                    name,
                    description: description ?? null,
                    isDefault
                }
            });

            await tx.workflowStage.deleteMany({
                where: { workflowId }
            });

            await tx.workflowStage.createMany({
                data: stages.map((s) => ({
                    workflowId,
                    stageLibraryId: s.stageLibraryId,
                    order: s.order
                }))
            });

            return await tx.workflow.findUnique({
                where: { id: workflowId },
                select: {
                    id: true,
                    companyId: true,
                    name: true,
                    description: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                    stages: {
                        select: {
                            id: true,
                            workflowId: true,
                            stageLibraryId: true,
                            order: true,
                            stageLibrary: {
                                select: {
                                    id: true,
                                    name: true,
                                    type: true
                                }
                            }
                        },
                        orderBy: {
                            order: "asc"
                        }
                    }
                }
            });
        });
    }

    static async isWorkflowUsedInJobs(workflowId: string): Promise<boolean> {
        const count = await prisma.job.count({
            where: { workflowId }
        });
        return count > 0;
    }

    static async deleteWorkflow(workflowId: string): Promise<void> {
        await prisma.workflow.delete({
            where: { id: workflowId }
        });
    }

    static async setDefaultWorkflow(
        workflowId: string,
        companyId: string
    ): Promise<GetWorkflowDetailsByIdView | null> {
        return await prisma.$transaction(async (tx) => {
            await tx.workflow.updateMany({
                where: { companyId, isDefault: true },
                data: { isDefault: false }
            });

            await tx.workflow.update({
                where: { id: workflowId },
                data: { isDefault: true }
            });

            return await tx.workflow.findUnique({
                where: { id: workflowId },
                select: {
                    id: true,
                    companyId: true,
                    name: true,
                    description: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                    stages: {
                        select: {
                            id: true,
                            workflowId: true,
                            stageLibraryId: true,
                            order: true,
                            stageLibrary: {
                                select: {
                                    id: true,
                                    name: true,
                                    type: true
                                }
                            }
                        },
                        orderBy: {
                            order: "asc"
                        }
                    }
                }
            });
        });
    }
}
