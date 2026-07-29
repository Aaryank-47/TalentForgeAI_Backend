import prisma from "../../../config/database.js";
import { StageType } from "@prisma/client";
export class StageLibRepositories {
    static async getStageByName(name, type = StageType.CUSTOM) {
        return await prisma.stageLibrary.findFirst({
            where: {
                name: name,
                type: type
            }
        });
    }
    static async createStage(name, companyId, type = StageType.CUSTOM) {
        return await prisma.stageLibrary.create({
            data: {
                name,
                type,
                companyId: companyId || null
            },
            select: {
                id: true,
                name: true,
                type: true,
                createdAt: true,
                updatedAt: true,
                companyId: true,
            }
        });
    }
    static async getStagesByType(type) {
        return await prisma.stageLibrary.findMany({
            where: {
                type: type
            },
            select: {
                id: true,
                name: true,
                type: true,
                companyId: true,
            }
        });
    }
    static async getStagesByCompanyIdAndType(companyId) {
        return await prisma.stageLibrary.findMany({
            where: {
                companyId: companyId
            },
            select: {
                id: true,
                name: true,
                type: true,
                companyId: true,
            }
        });
    }
    static async getStageById(stageId) {
        return await prisma.stageLibrary.findUnique({
            where: {
                id: stageId
            }
        });
    }
    static async updateStage(stageId, data) {
        return await prisma.stageLibrary.update({
            where: {
                id: stageId,
                type: StageType.CUSTOM
            },
            data: data,
            select: {
                id: true,
                name: true,
                type: true,
                companyId: true
            }
        });
    }
    static async isStageUsedInWorkflow(stageId) {
        const count = await prisma.workflowStage.count({
            where: {
                stageLibraryId: stageId
            }
        });
        return count > 0;
    }
    static async deleteStage(stageId) {
        await prisma.stageLibrary.delete({
            where: {
                id: stageId
            }
        });
    }
}
//# sourceMappingURL=stage-library.repository.js.map