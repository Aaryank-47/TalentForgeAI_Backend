import { z } from "zod";
import { workflowIdValidator, uuidValidator, workflowNameValidator, workflowDescriptionValidator, workflowStatusValidator, workflowIsDefaultValidator, stageNameValidator, stageDescriptionValidator, stageTypeValidator, stageIsActiveValidator, workflowStageIdValidator, stageOrderValidator, stageIsEnabledValidator, stageIsFinalValidator, applicationWorkflowIdValidator, remarksValidator, workflowHistoryIdValidator, commentValidator, stageLibraryIdValidator, companyIdValidator, jobIdValidator } from "../../../common/validators/validators.js";
export class WorkflowDto {
    static createWorkflow = z.object({
        name: workflowNameValidator,
        description: workflowDescriptionValidator,
        stages: z.array(stageNameValidator).min(1, "At least one stage name is required"),
    });
    static updateWorkflow = z.object({
        name: workflowNameValidator,
        description: workflowDescriptionValidator.optional(),
        isDefault: z.boolean().optional(),
        stages: z.array(z.object({
            stageLibraryId: stageLibraryIdValidator,
            order: stageOrderValidator,
        })).min(1, "At least one stage is required"),
    });
    static getWorkflowsByStatus = z.object({
        status: workflowStatusValidator
    });
    static deleteWorkflow = z.object({
        id: workflowIdValidator,
    });
    static getWorkflowById = z.object({
        id: workflowIdValidator,
    });
    static getWorkflowsByCompany = z.object({
        companyId: uuidValidator,
    });
    static createCustomStage = z.object({
        name: stageNameValidator,
        type: stageTypeValidator.optional(),
    });
    static createStageLibrary = z.object({
        name: stageNameValidator,
        description: stageDescriptionValidator,
        type: stageTypeValidator,
        isActive: stageIsActiveValidator,
    });
    static updateStageLibrary = z.object({
        name: stageNameValidator,
        type: stageTypeValidator
    });
    static deleteStageLibrary = z.object({
        id: stageLibraryIdValidator,
    });
    static getStageLibraryById = z.object({
        id: stageLibraryIdValidator,
    });
    static stageIdParam = z.object({
        stageId: stageLibraryIdValidator,
    });
    static workflowIdParam = z.object({
        workflowId: workflowIdValidator,
    });
    static getStageLibrariesByCompany = z.object({
        companyId: uuidValidator,
    });
    static createWorkflowStage = z.object({
        workflowId: workflowIdValidator,
        stageLibraryId: stageLibraryIdValidator,
        stageOrder: stageOrderValidator,
        isEnabled: stageIsEnabledValidator,
        isFinal: stageIsFinalValidator,
    });
    static updateWorkflowStage = z.object({
        id: workflowStageIdValidator,
        workflowId: workflowIdValidator,
        stageLibraryId: stageLibraryIdValidator,
        stageOrder: stageOrderValidator,
        isEnabled: stageIsEnabledValidator,
        isFinal: stageIsFinalValidator,
    });
    static deleteWorkflowStage = z.object({
        id: workflowStageIdValidator,
    });
    static getWorkflowStageById = z.object({
        id: workflowStageIdValidator,
    });
    static getWorkflowStagesByWorkflow = z.object({
        workflowId: workflowIdValidator,
    });
    static createApplicationWorkflow = z.object({
        applicationId: uuidValidator,
        workflowStageId: workflowStageIdValidator,
    });
    static updateApplicationWorkflow = z.object({
        id: applicationWorkflowIdValidator,
        applicationId: uuidValidator,
        workflowId: workflowIdValidator,
    });
    static deleteApplicationWorkflow = z.object({
        id: applicationWorkflowIdValidator,
    });
    static getApplicationWorkflowById = z.object({
        id: applicationWorkflowIdValidator,
    });
    static getApplicationWorkflowsByApplication = z.object({
        applicationId: uuidValidator,
    });
    static createWorkflowHistory = z.object({
        applicationWorkflowId: applicationWorkflowIdValidator,
        stageId: workflowStageIdValidator,
        stageName: stageNameValidator,
        stageType: stageTypeValidator,
        action: z.enum(["APPLIED", "INREVIEW", "WITHDRAWN", "HIRED", "REJECTED"]),
        comments: commentValidator,
    });
    static updateWorkflowHistory = z.object({
        id: workflowHistoryIdValidator,
        applicationWorkflowId: applicationWorkflowIdValidator,
        stageId: workflowStageIdValidator,
        stageName: stageNameValidator,
        stageType: stageTypeValidator,
        action: z.enum(["APPLIED", "INREVIEW", "WITHDRAWN", "HIRED", "REJECTED"]),
        comments: commentValidator,
    });
    static deleteWorkflowHistory = z.object({
        id: workflowHistoryIdValidator,
    });
    static getWorkflowHistoryById = z.object({
        id: workflowHistoryIdValidator,
    });
    static getWorkflowHistoriesByApplicationWorkflow = z.object({
        applicationWorkflowId: applicationWorkflowIdValidator,
    });
    static advanceStage = z.object({
        applicationWorkflowId: applicationWorkflowIdValidator,
        stageLibraryId: stageLibraryIdValidator,
        remarks: remarksValidator,
    });
    static rejectApplication = z.object({
        applicationWorkflowId: applicationWorkflowIdValidator,
        stageLibraryId: stageLibraryIdValidator,
        remarks: remarksValidator,
    });
    static holdApplication = z.object({
        applicationWorkflowId: applicationWorkflowIdValidator,
        stageLibraryId: stageLibraryIdValidator,
        remarks: remarksValidator,
    });
    static cancelApplication = z.object({
        applicationWorkflowId: applicationWorkflowIdValidator,
        stageLibraryId: stageLibraryIdValidator,
        remarks: remarksValidator,
    });
    static restartStage = z.object({
        applicationWorkflowId: applicationWorkflowIdValidator,
        stageLibraryId: stageLibraryIdValidator,
        remarks: remarksValidator,
    });
    static getHiringBoard = z.object({
        jobId: jobIdValidator,
    });
    static moveApplicationToNextStage = z.object({
        applicationId: uuidValidator,
        toWorkflowStageId: uuidValidator,
        remarks: remarksValidator.optional(),
        assignedTo: uuidValidator.optional(),
    });
    static bulkMoveApplicationsToNextStage = z.object({
        applicationIds: z.array(uuidValidator).min(1, "At least one application ID is required"),
        toWorkflowStageId: uuidValidator,
        remarks: remarksValidator.optional(),
        assignedTo: uuidValidator.optional(),
    });
}
//# sourceMappingURL=hiring-workflow.dto.js.map