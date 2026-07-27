import { z } from "zod";
import {
    workflowIdValidator,
    uuidValidator,
    workflowNameValidator,
    workflowDescriptionValidator,
    workflowStatusValidator,
    workflowIsDefaultValidator,
    stageNameValidator,
    stageDescriptionValidator,
    stageTypeValidator,
    stageIsActiveValidator,
    workflowStageIdValidator,
    stageOrderValidator,
    stageIsEnabledValidator,
    stageIsFinalValidator,
    applicationWorkflowIdValidator,
    remarksValidator,
    workflowHistoryIdValidator,
    commentValidator,
    stageLibraryIdValidator
} from "../../../common/validators/validators.js"




export class WorkflowDto{
    
    static createWorkflow = z.object({
        name: workflowNameValidator,
        description: workflowDescriptionValidator,
        stages: z.array(stageNameValidator).min(1, "At least one stage name is required"),
    });

    static updateWorkflow = z.object({
        name: workflowNameValidator,
        description: workflowDescriptionValidator,
        status: workflowStatusValidator,
        isDefault: workflowIsDefaultValidator,
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
        workflowId: workflowIdValidator,
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
}

export type CreateWorkflowDto = z.infer<typeof WorkflowDto.createWorkflow>;
export type UpdateWorkflowDto = z.infer<typeof WorkflowDto.updateWorkflow>;
export type DeleteWorkflowDto = z.infer<typeof WorkflowDto.deleteWorkflow>;
export type GetWorkflowByIdDto = z.infer<typeof WorkflowDto.getWorkflowById>;
export type GetWorkflowsByCompanyDto = z.infer<typeof WorkflowDto.getWorkflowsByCompany>;

export type CreateStageLibraryDto = z.infer<typeof WorkflowDto.createStageLibrary>;
export type UpdateStageLibraryDto = z.infer<typeof WorkflowDto.updateStageLibrary>;
export type DeleteStageLibraryDto = z.infer<typeof WorkflowDto.deleteStageLibrary>;
export type GetStageLibraryByIdDto = z.infer<typeof WorkflowDto.getStageLibraryById>;
export type GetStageLibrariesByCompanyDto = z.infer<typeof WorkflowDto.getStageLibrariesByCompany>;

export type CreateWorkflowStageDto = z.infer<typeof WorkflowDto.createWorkflowStage>;
export type UpdateWorkflowStageDto = z.infer<typeof WorkflowDto.updateWorkflowStage>;
export type DeleteWorkflowStageDto = z.infer<typeof WorkflowDto.deleteWorkflowStage>;
export type GetWorkflowStageByIdDto = z.infer<typeof WorkflowDto.getWorkflowStageById>;
export type GetWorkflowStagesByWorkflowDto = z.infer<typeof WorkflowDto.getWorkflowStagesByWorkflow>;

export type CreateApplicationWorkflowDto = z.infer<typeof WorkflowDto.createApplicationWorkflow>;
export type UpdateApplicationWorkflowDto = z.infer<typeof WorkflowDto.updateApplicationWorkflow>;
export type DeleteApplicationWorkflowDto = z.infer<typeof WorkflowDto.deleteApplicationWorkflow>;
export type GetApplicationWorkflowByIdDto = z.infer<typeof WorkflowDto.getApplicationWorkflowById>;
export type GetApplicationWorkflowsByApplicationDto = z.infer<typeof WorkflowDto.getApplicationWorkflowsByApplication>;

export type CreateWorkflowHistoryDto = z.infer<typeof WorkflowDto.createWorkflowHistory>;
export type UpdateWorkflowHistoryDto = z.infer<typeof WorkflowDto.updateWorkflowHistory>;
export type DeleteWorkflowHistoryDto = z.infer<typeof WorkflowDto.deleteWorkflowHistory>;
export type GetWorkflowHistoryByIdDto = z.infer<typeof WorkflowDto.getWorkflowHistoryById>;
export type GetWorkflowHistoriesByApplicationWorkflowDto = z.infer<typeof WorkflowDto.getWorkflowHistoriesByApplicationWorkflow>;

export type AdvanceStageDto = z.infer<typeof WorkflowDto.advanceStage>;
export type RejectApplicationDto = z.infer<typeof WorkflowDto.rejectApplication>;
export type HoldApplicationDto = z.infer<typeof WorkflowDto.holdApplication>;
export type CancelApplicationDto = z.infer<typeof WorkflowDto.cancelApplication>;
export type RestartStageDto = z.infer<typeof WorkflowDto.restartStage>;
export type CreateCustomStageDto = z.infer<typeof WorkflowDto.createCustomStage>;