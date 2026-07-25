import { StageLibRepositories } from "../repositories/stage-library.repository.js"
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import type { 
    CreateCustomStageInput,
    CreateCustomStageView
} from "../interfaces/hiring-workflow.interface.js"

export class StageLibServices {
    static async createCustomStage(
        payload: CreateCustomStageInput,
    ):Promise<CreateCustomStageView> {
        const stageName = await StageLibRepositories.getStageByName(payload.name,payload.type);
        if(stageName) throw new ConflictError(`${payload.type} with name ${payload.name} already exists`);

        const  newStage = await StageLibRepositories.createCustomStage(
            payload.name,
            payload.companyId,
            payload.type,
        );
        return newStage;
    }


}
