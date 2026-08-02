import { StageLibRepositories } from "../repositories/stage-library.repository.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { ForbiddenError } from "../../../common/errors/ForbiddenError.js";
import { StageType } from "@prisma/client";
function normalizeName(name) {
    return name.toLowerCase().replace(/[\s\-_]+/g, "");
}
export class StageLibServices {
    static async createSystemStage(name, type = StageType.SYSTEM) {
        const systemStages = await StageLibRepositories.getStagesByType(StageType.SYSTEM);
        const normalized = normalizeName(name);
        const duplicate = systemStages.find(s => normalizeName(s.name) === normalized);
        if (duplicate)
            throw new ConflictError(`${type} with name ${name} already exists`);
        const newStage = await StageLibRepositories.createStage(name, null, type);
        return newStage;
    }
    static async createCustomStage(payload) {
        const companyId = payload.companyId || "";
        const companyStages = await StageLibRepositories.getStagesByCompanyIdAndType(companyId);
        const normalized = normalizeName(payload.name);
        const duplicate = companyStages.find(s => normalizeName(s.name) === normalized);
        if (duplicate)
            throw new ConflictError(`${payload.type} with name ${payload.name} already exists`);
        const newStage = await StageLibRepositories.createStage(payload.name, payload.companyId || "", payload.type);
        return newStage;
    }
    static async getCustomAndSystemStages(companyId) {
        const SystemStages = await StageLibRepositories.getStagesByType(StageType.SYSTEM);
        const companyStages = await StageLibRepositories.getStagesByCompanyIdAndType(companyId);
        return [...SystemStages, ...companyStages];
    }
    static async updateCustomStage(name, type, stageId, companyId) {
        const stage = await StageLibRepositories.getStageById(stageId);
        if (!stage)
            throw new NotFoundError("Stage not found");
        if (stage.companyId !== companyId)
            throw new Error("Unauthorized");
        const companyStages = await StageLibRepositories.getStagesByCompanyIdAndType(companyId);
        const normalized = normalizeName(name);
        const duplicate = companyStages.find(s => normalizeName(s.name) === normalized && s.id !== stageId);
        if (duplicate) {
            throw new ConflictError(`Custom stage with name ${name} already exists`);
        }
        const updatedStage = await StageLibRepositories.updateStage(stageId, { name: name, type: type });
        return updatedStage;
    }
    static async deleteCustomStage(stageId, companyId) {
        const stage = await StageLibRepositories.getStageById(stageId);
        if (!stage)
            throw new NotFoundError("Stage not found");
        if (stage.companyId !== companyId)
            throw new ForbiddenError("You do not have permission to delete this stage");
        const isUsed = await StageLibRepositories.isStageUsedInWorkflow(stageId);
        if (isUsed) {
            throw new ConflictError("Stage is currently in use in a workflow and cannot be deleted");
        }
        await StageLibRepositories.deleteStage(stageId);
    }
    static async deleteSystemStage(stageId) {
        const stage = await StageLibRepositories.getStageById(stageId);
        if (!stage)
            throw new NotFoundError("Stage not found");
        if (stage.type !== StageType.SYSTEM) {
            throw new ForbiddenError("Only system stages can be deleted using this endpoint");
        }
        const isUsed = await StageLibRepositories.isStageUsedInWorkflow(stageId);
        if (isUsed) {
            throw new ConflictError("Stage is currently in use in a workflow and cannot be deleted");
        }
        await StageLibRepositories.deleteStage(stageId);
    }
}
//# sourceMappingURL=stage-library.service.js.map