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
}