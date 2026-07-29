import type { ApplicationWorkflow } from "@prisma/client";
export declare class ApplicationWorkflowRepository {
    static getWorkflowStageById(workflowStageId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workflowId: string;
        stageLibraryId: string;
        order: number;
        isEnabled: boolean;
        isFinal: boolean;
    } | null>;
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
}
//# sourceMappingURL=application-workflow.repository.d.ts.map