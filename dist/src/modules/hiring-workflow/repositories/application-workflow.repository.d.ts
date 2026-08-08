import type { ApplicationWorkflow } from "@prisma/client";
export declare class ApplicationWorkflowRepository {
    static getWorkflowStageById(workflowStageId: string): Promise<({
        stageLibrary: {
            type: import("@prisma/client").$Enums.StageType;
            companyId: string | null;
            description: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workflowId: string;
        stageLibraryId: string;
        order: number;
        isEnabled: boolean;
        isFinal: boolean;
        assessmentId: string | null;
    }) | null>;
    static getApplicationWorkflowByApplicationId(applicationId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        applicationId: string;
        workflowStageId: string;
        assignedEmployerId: string | null;
        remarks: string | null;
        movedAt: Date;
    } | null>;
    static createApplicationWorkflow(data: {
        applicationId: string;
        workflowStageId: string;
        movedByEmployerId?: string;
        comment?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        applicationId: string;
        workflowStageId: string;
        assignedEmployerId: string | null;
        remarks: string | null;
        movedAt: Date;
    }>;
    static getFirstWorkflowStage(workflowId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workflowId: string;
        stageLibraryId: string;
        order: number;
        isEnabled: boolean;
        isFinal: boolean;
        assessmentId: string | null;
    } | null>;
    static getDefaultWorkflowStageForCompany(companyId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workflowId: string;
        stageLibraryId: string;
        order: number;
        isEnabled: boolean;
        isFinal: boolean;
        assessmentId: string | null;
    } | null>;
    static updateApplicationWorkflow(movedByEmployerId: string, applicationId: string, fromStageId: string, toStageId: string, comment?: string, assignedTo?: string): Promise<ApplicationWorkflow>;
    static bulkUpdateApplicationWorkflows(data: {
        movedByEmployerId: string;
        toStageId: string;
        comment?: string;
        assignedTo?: string;
        items: Array<{
            applicationId: string;
            fromStageId: string;
            applicationWorkflowId: string;
        }>;
    }): Promise<ApplicationWorkflow[]>;
    static getApplicationWorkflowsByApplicationIds(applicationIds: string[]): Promise<ApplicationWorkflow[]>;
    static getApplicationWorkflowWithStages(applicationId: string): Promise<any>;
    static getWorkflowHistoryByWorkflowId(applicationWorkflowId: string): Promise<any[]>;
}
//# sourceMappingURL=application-workflow.repository.d.ts.map