import { StageType } from "@prisma/client";
import type { CreateCustomStageView } from "../interfaces/hiring-workflow.interface.js";
export declare class StageLibRepositories {
    static getStageByName(name: string, type?: StageType): Promise<{
        type: import("@prisma/client").$Enums.StageType;
        companyId: string | null;
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    } | null>;
    static createStage(name: string, companyId: string | null, type?: StageType): Promise<CreateCustomStageView>;
    static getStagesByType(type: StageType): Promise<CreateCustomStageView[]>;
    static getStagesByCompanyIdAndType(companyId: string): Promise<CreateCustomStageView[]>;
    static getStageById(stageId: string): Promise<CreateCustomStageView | null>;
    static updateStage(stageId: string, data: {
        name: string;
        type: StageType;
    }): Promise<CreateCustomStageView>;
    static isStageUsedInWorkflow(stageId: string): Promise<boolean>;
    static deleteStage(stageId: string): Promise<void>;
}
//# sourceMappingURL=stage-library.repository.d.ts.map