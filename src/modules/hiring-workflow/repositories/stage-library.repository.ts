import prisma from "../../../config/database.js";
import { StageType } from "@prisma/client";
import type { 
    CreateCustomStageView
} from "../interfaces/hiring-workflow.interface.js"


export class StageLibRepositories {
    static async getStageByName(
        name: string,
        type: StageType = StageType.CUSTOM
    ) {
        return await prisma.stageLibrary.findFirst({
            where: {
                name: name,
                type: type
            }
        })
    }

    static async createStage(
        name: string,
        companyId:string | null,
        type:StageType = StageType.CUSTOM,
    ):Promise<CreateCustomStageView>{
        return await prisma.stageLibrary.create({
            data:{
                name,
                type,
                companyId: companyId || null
            },
             
            select:{
                id: true,
                name: true,
                type: true,
                createdAt: true,
                updatedAt: true,
                companyId: true,
            }
        })
    }

    static async getStagesByType(
        type: StageType
    ):Promise<CreateCustomStageView[]>{
        return await prisma.stageLibrary.findMany({
            where: {
                type: type
            },
            select:{
                id: true,
                name: true,
                type: true,
                companyId: true,
            }
        })
    }

    static async getStagesByCompanyIdAndType(
        companyId: string
    ):Promise<CreateCustomStageView[]>{
        return await prisma.stageLibrary.findMany({
            where: {
                companyId: companyId
            },
            select:{
                id: true,
                name: true,
                type: true,
                companyId: true,
            }
        })
    }

    static async getStageById(
        stageId: string,
    ):Promise<CreateCustomStageView | null>{
        return await prisma.stageLibrary.findUnique({
            where: {
                id: stageId
            }
        })
    }

    static async updateStage(
        stageId: string,
        data: {
            name: string;
            type: StageType;
        }
    ):Promise<CreateCustomStageView>{
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
        })
    }

    static async isStageUsedInWorkflow(stageId: string): Promise<boolean> {
        const count = await prisma.workflowStage.count({
            where: {
                stageLibraryId: stageId
            }
        });
        return count > 0;
    }

    static async deleteStage(stageId: string): Promise<void> {
        await prisma.stageLibrary.delete({
            where: {
                id: stageId
            }
        });
    }
}