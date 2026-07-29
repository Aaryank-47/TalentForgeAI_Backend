import { z } from "zod";
export declare class WorkflowDto {
    static createWorkflow: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        stages: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
    static updateWorkflow: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        isDefault: z.ZodOptional<z.ZodBoolean>;
        stages: z.ZodArray<z.ZodObject<{
            stageLibraryId: z.ZodString;
            order: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    static getWorkflowsByStatus: z.ZodObject<{
        status: z.ZodEnum<{
            ACTIVE: "ACTIVE";
            INACTIVE: "INACTIVE";
        }>;
    }, z.core.$strip>;
    static deleteWorkflow: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    static getWorkflowById: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    static getWorkflowsByCompany: z.ZodObject<{
        companyId: z.ZodString;
    }, z.core.$strip>;
    static createCustomStage: z.ZodObject<{
        name: z.ZodString;
        type: z.ZodOptional<z.ZodEnum<{
            SYSTEM: "SYSTEM";
            CUSTOM: "CUSTOM";
        }>>;
    }, z.core.$strip>;
    static createStageLibrary: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        type: z.ZodEnum<{
            SYSTEM: "SYSTEM";
            CUSTOM: "CUSTOM";
        }>;
        isActive: z.ZodBoolean;
    }, z.core.$strip>;
    static updateStageLibrary: z.ZodObject<{
        name: z.ZodString;
        type: z.ZodEnum<{
            SYSTEM: "SYSTEM";
            CUSTOM: "CUSTOM";
        }>;
    }, z.core.$strip>;
    static deleteStageLibrary: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    static getStageLibraryById: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    static stageIdParam: z.ZodObject<{
        stageId: z.ZodString;
    }, z.core.$strip>;
    static workflowIdParam: z.ZodObject<{
        workflowId: z.ZodString;
    }, z.core.$strip>;
    static getStageLibrariesByCompany: z.ZodObject<{
        companyId: z.ZodString;
    }, z.core.$strip>;
    static createWorkflowStage: z.ZodObject<{
        workflowId: z.ZodString;
        stageLibraryId: z.ZodString;
        stageOrder: z.ZodNumber;
        isEnabled: z.ZodBoolean;
        isFinal: z.ZodBoolean;
    }, z.core.$strip>;
    static updateWorkflowStage: z.ZodObject<{
        id: z.ZodString;
        workflowId: z.ZodString;
        stageLibraryId: z.ZodString;
        stageOrder: z.ZodNumber;
        isEnabled: z.ZodBoolean;
        isFinal: z.ZodBoolean;
    }, z.core.$strip>;
    static deleteWorkflowStage: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    static getWorkflowStageById: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    static getWorkflowStagesByWorkflow: z.ZodObject<{
        workflowId: z.ZodString;
    }, z.core.$strip>;
    static createApplicationWorkflow: z.ZodObject<{
        applicationId: z.ZodString;
        workflowStageId: z.ZodString;
    }, z.core.$strip>;
    static updateApplicationWorkflow: z.ZodObject<{
        id: z.ZodString;
        applicationId: z.ZodString;
        workflowId: z.ZodString;
    }, z.core.$strip>;
    static deleteApplicationWorkflow: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    static getApplicationWorkflowById: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    static getApplicationWorkflowsByApplication: z.ZodObject<{
        applicationId: z.ZodString;
    }, z.core.$strip>;
    static createWorkflowHistory: z.ZodObject<{
        applicationWorkflowId: z.ZodString;
        stageId: z.ZodString;
        stageName: z.ZodString;
        stageType: z.ZodEnum<{
            SYSTEM: "SYSTEM";
            CUSTOM: "CUSTOM";
        }>;
        action: z.ZodEnum<{
            APPLIED: "APPLIED";
            INREVIEW: "INREVIEW";
            WITHDRAWN: "WITHDRAWN";
            HIRED: "HIRED";
            REJECTED: "REJECTED";
        }>;
        comments: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    static updateWorkflowHistory: z.ZodObject<{
        id: z.ZodString;
        applicationWorkflowId: z.ZodString;
        stageId: z.ZodString;
        stageName: z.ZodString;
        stageType: z.ZodEnum<{
            SYSTEM: "SYSTEM";
            CUSTOM: "CUSTOM";
        }>;
        action: z.ZodEnum<{
            APPLIED: "APPLIED";
            INREVIEW: "INREVIEW";
            WITHDRAWN: "WITHDRAWN";
            HIRED: "HIRED";
            REJECTED: "REJECTED";
        }>;
        comments: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    static deleteWorkflowHistory: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    static getWorkflowHistoryById: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    static getWorkflowHistoriesByApplicationWorkflow: z.ZodObject<{
        applicationWorkflowId: z.ZodString;
    }, z.core.$strip>;
    static advanceStage: z.ZodObject<{
        applicationWorkflowId: z.ZodString;
        stageLibraryId: z.ZodString;
        remarks: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    static rejectApplication: z.ZodObject<{
        applicationWorkflowId: z.ZodString;
        stageLibraryId: z.ZodString;
        remarks: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    static holdApplication: z.ZodObject<{
        applicationWorkflowId: z.ZodString;
        stageLibraryId: z.ZodString;
        remarks: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    static cancelApplication: z.ZodObject<{
        applicationWorkflowId: z.ZodString;
        stageLibraryId: z.ZodString;
        remarks: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    static restartStage: z.ZodObject<{
        applicationWorkflowId: z.ZodString;
        stageLibraryId: z.ZodString;
        remarks: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    static getHiringBoard: z.ZodObject<{
        jobId: z.ZodString;
    }, z.core.$strip>;
}
export type CreateWorkflowDto = z.infer<typeof WorkflowDto.createWorkflow>;
export type UpdateWorkflowDto = z.infer<typeof WorkflowDto.updateWorkflow>;
export type DeleteWorkflowDto = z.infer<typeof WorkflowDto.deleteWorkflow>;
export type GetWorkflowByIdDto = z.infer<typeof WorkflowDto.getWorkflowById>;
export type GetWorkflowsByCompanyDto = z.infer<typeof WorkflowDto.getWorkflowsByCompany>;
export type WorkflowIdParamDto = z.infer<typeof WorkflowDto.workflowIdParam>;
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
export type GetHiringBoardDto = z.infer<typeof WorkflowDto.getHiringBoard>;
//# sourceMappingURL=hiring-workflow.dto.d.ts.map