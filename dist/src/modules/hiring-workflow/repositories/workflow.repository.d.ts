import { WorkflowStatus } from "@prisma/client";
import type { CreateWorkflowView, GetWorkflowDetailsByIdView, CompanyWorkflowView } from "../interfaces/hiring-workflow.interface.js";
export declare class WorkflowRepository {
    static findWorkflowNameExistingInCompany(name: string, companyId: string): Promise<any>;
    static getWorkflowStagesByWorkflowId(workflowId: string): Promise<any>;
    static validateAssessments(assessmentIds: string[], companyId: string): Promise<void>;
    static createWorkflow(name: string, description: string, stages: (string | {
        name: string;
        assessmentId?: string | null;
    })[], companyId: string, status: WorkflowStatus): Promise<CreateWorkflowView>;
    static getWorkflowsByCompanyId(companyId: string, status?: WorkflowStatus): Promise<CompanyWorkflowView[]>;
    static getWorkflowById(workflowId: string): Promise<any>;
    static getWorkflowDetails(workflowId: string): Promise<GetWorkflowDetailsByIdView | null>;
    static updateWorkflow(workflowId: string, name: string, description: string | undefined, isDefault: boolean, stages: {
        stageLibraryId: string;
        order: number;
        assessmentId?: string | null;
    }[], companyId: string): Promise<GetWorkflowDetailsByIdView | null>;
    static isWorkflowUsedInJobs(workflowId: string): Promise<boolean>;
    static deleteWorkflow(workflowId: string): Promise<void>;
    static setDefaultWorkflow(workflowId: string, companyId: string): Promise<GetWorkflowDetailsByIdView | null>;
}
//# sourceMappingURL=workflow.repository.d.ts.map