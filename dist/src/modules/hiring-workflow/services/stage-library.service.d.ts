import { StageType } from "@prisma/client";
import type { CreateCustomStageInput, CreateCustomStageView } from "../interfaces/hiring-workflow.interface.js";
export declare class StageLibServices {
    static createSystemStage(name: string, type?: StageType): Promise<CreateCustomStageView>;
    static createCustomStage(payload: CreateCustomStageInput): Promise<CreateCustomStageView>;
    static getCustomAndSystemStages(companyId: string): Promise<CreateCustomStageView[]>;
    static updateCustomStage(anme: string, type: StageType, stageId: string, companyId: string): Promise<CreateCustomStageView>;
    static deleteCustomStage(stageId: string, companyId: string): Promise<void>;
    static deleteSystemStage(stageId: string): Promise<void>;
}
//# sourceMappingURL=stage-library.service.d.ts.map