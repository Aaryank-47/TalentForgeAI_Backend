import prisma from "../../../config/database.js"
import { StageType } from "@prisma/client"
import { ConflictError } from "../../../common/errors/ConflictError.js"
import type { CreateWorkflowView } from "../interfaces/hiring-workflow.interface.js"

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
                        }
                    }
                })
            }
        )
    }
}
