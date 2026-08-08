import prisma from "../../../config/database.js";
import { StageType, WorkflowStatus } from "@prisma/client";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ForbiddenError } from "../../../common/errors/ForbiddenError.js";
export class WorkflowRepository {
    static async findWorkflowNameExistingInCompany(name, companyId) {
        return await prisma.workflow.findUnique({
            where: {
                companyId_name: {
                    companyId: companyId,
                    name: name
                }
            }
        });
    }
    static async getWorkflowStagesByWorkflowId(workflowId) {
        return prisma.workflow.findUnique({
            where: {
                id: workflowId
            },
            select: {
                stages: {
                    select: {
                        id: true,
                        workflowId: true,
                        stageLibraryId: true,
                        order: true,
                        assessmentId: true,
                        assessment: {
                            select: {
                                id: true,
                                title: true,
                                status: true
                            }
                        },
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
    }
    static async validateAssessments(assessmentIds, companyId) {
        if (assessmentIds.length === 0)
            return;
        const assessments = await prisma.assessment.findMany({
            where: { id: { in: assessmentIds }, deletedAt: null }
        });
        const assessmentMap = new Map(assessments.map((a) => [a.id, a]));
        for (const id of assessmentIds) {
            const assessment = assessmentMap.get(id);
            if (!assessment) {
                throw new NotFoundError(`Assessment with ID ${id} not found`);
            }
            if (assessment.status !== "PUBLISHED") {
                throw new ConflictError(`Assessment with ID ${id} is not published`);
            }
            if (assessment.companyId !== companyId && !assessment.isTemplate) {
                throw new ForbiddenError(`Assessment with ID ${id} does not belong to this company`);
            }
        }
    }
    static async createWorkflow(name, description, stages, companyId, status) {
        return prisma.$transaction(async (tx) => {
            const stageNames = stages.map((stage) => (typeof stage === "string" ? stage : stage.name));
            const uniqueStageNames = Array.from(new Set(stageNames));
            const existingStageLibs = await tx.stageLibrary.findMany({
                where: { name: { in: uniqueStageNames } }
            });
            const stageLibMap = new Map(existingStageLibs.map((s) => [s.name, s]));
            const toCreate = [];
            for (const name of uniqueStageNames) {
                if (!stageLibMap.has(name)) {
                    toCreate.push({
                        name,
                        type: StageType.CUSTOM,
                        companyId: companyId
                    });
                    stageLibMap.set(name, {});
                }
            }
            if (toCreate.length > 0) {
                await tx.stageLibrary.createMany({
                    data: toCreate
                });
                const newlyCreated = await tx.stageLibrary.findMany({
                    where: {
                        name: { in: toCreate.map((tc) => tc.name) },
                        companyId: companyId
                    }
                });
                for (const nl of newlyCreated) {
                    stageLibMap.set(nl.name, nl);
                }
            }
            const workflowStagesData = [];
            let order = 1;
            for (const stage of stages) {
                const stageName = typeof stage === "string" ? stage : stage.name;
                const assessmentId = typeof stage === "string" ? null : (stage.assessmentId || null);
                const stageLib = stageLibMap.get(stageName);
                if (!stageLib || !stageLib.id) {
                    throw new NotFoundError(`Stage library for '${stageName}' not found`);
                }
                if (stageLib.type === StageType.CUSTOM && stageLib.companyId !== companyId) {
                    throw new ConflictError(`Conflict: Stage '${stageName}' exists but is not associated with this company.`);
                }
                workflowStagesData.push({
                    stageLibraryId: stageLib.id,
                    order: order++,
                    assessmentId: assessmentId
                });
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
            });
        });
    }
    static async getWorkflowsByCompanyId(companyId, status) {
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
                        assessmentId: true,
                        assessment: {
                            select: {
                                id: true,
                                title: true,
                                status: true
                            }
                        },
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
    }
    static async getWorkflowById(workflowId) {
        return await prisma.workflow.findUnique({
            where: {
                id: workflowId
            }
        });
    }
    static async getWorkflowDetails(workflowId) {
        return await prisma.workflow.findUnique({
            where: {
                id: workflowId
            },
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
                        assessmentId: true,
                        assessment: {
                            select: {
                                id: true,
                                title: true,
                                status: true
                            }
                        },
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
    }
    static async updateWorkflow(workflowId, name, description, isDefault, stages, companyId) {
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
                    order: s.order,
                    assessmentId: s.assessmentId ?? null
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
                            assessmentId: true,
                            assessment: {
                                select: {
                                    id: true,
                                    title: true,
                                    status: true
                                }
                            },
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
    static async isWorkflowUsedInJobs(workflowId) {
        const count = await prisma.job.count({
            where: { workflowId }
        });
        return count > 0;
    }
    static async deleteWorkflow(workflowId) {
        await prisma.workflow.delete({
            where: { id: workflowId }
        });
    }
    static async setDefaultWorkflow(workflowId, companyId) {
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
                            assessmentId: true,
                            assessment: {
                                select: {
                                    id: true,
                                    title: true,
                                    status: true
                                }
                            },
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
//# sourceMappingURL=workflow.repository.js.map