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

    static async createCustomStage(
        name: string,
        companyId:string,
        type:StageType = StageType.CUSTOM,
    ):Promise<CreateCustomStageView>{
        return await prisma.stageLibrary.create({
            data:{
                name,
                type,
                companyId
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
}