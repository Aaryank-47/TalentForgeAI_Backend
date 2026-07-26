import { StageLibRepositories } from "../repositories/stage-library.repository.js"
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { ForbiddenError } from "../../../common/errors/ForbiddenError.js";
import { StageType } from "@prisma/client";
import type { 
    CreateCustomStageInput,
    CreateCustomStageView
} from "../interfaces/hiring-workflow.interface.js"

export class StageLibServices {
    static async createSystemStage(
        name: string,
        type: StageType = StageType.SYSTEM
    ):Promise<CreateCustomStageView> {
        const stageName = await StageLibRepositories.getStageByName(name,type);
        if(stageName) throw new ConflictError(`${type} with name ${name} already exists`);

        const  newStage = await StageLibRepositories.createStage(
            name,
            null,
            type,
        );
        return newStage;
    }

    static async createCustomStage(
        payload: CreateCustomStageInput,
    ):Promise<CreateCustomStageView> {
        const stageName = await StageLibRepositories.getStageByName(payload.name,payload.type);
        if(stageName) throw new ConflictError(`${payload.type} with name ${payload.name} already exists`);

        const  newStage = await StageLibRepositories.createStage(
            payload.name,
            payload.companyId ||"",
            payload.type,
        );
        return newStage;
    }

    static async getCustomAndSystemStages(
        companyId: string,
    ):Promise<CreateCustomStageView[]>{
        const SystemStages = await StageLibRepositories.getStagesByType(StageType.SYSTEM);
        const companyStages = await StageLibRepositories.getStagesByCompanyIdAndType(companyId);
        return [...SystemStages, ...companyStages];
    }

    static async updateCustomStage(
        anme : string,
        type: StageType,
        stageId: string,
        companyId: string
    ): Promise<CreateCustomStageView>{
        
        const stage = await StageLibRepositories.getStageById(stageId);
        if(!stage) throw new NotFoundError("Stage not found");
        if(stage.companyId !== companyId) throw new Error("Unauthorized");
        
        const updatedStage = await StageLibRepositories.updateStage(stageId, {name: anme, type: type});
        return updatedStage;
    }

    static async deleteCustomStage(
        stageId: string,
        companyId: string
    ): Promise<void> {
        const stage = await StageLibRepositories.getStageById(stageId);
        if (!stage) throw new NotFoundError("Stage not found");
        if (stage.companyId !== companyId) throw new ForbiddenError("You do not have permission to delete this stage");

        const isUsed = await StageLibRepositories.isStageUsedInWorkflow(stageId);
        if (isUsed) {
            throw new ConflictError("Stage is currently in use in a workflow and cannot be deleted");
        }

        await StageLibRepositories.deleteStage(stageId);
    }
}
