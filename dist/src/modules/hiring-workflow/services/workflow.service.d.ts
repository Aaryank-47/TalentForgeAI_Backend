import type { CreateWorkflowView, GetWorkflowDetailsByIdView, CompanyWorkflowView } from "../interfaces/hiring-workflow.interface.js";
import { WorkflowStatus } from "@prisma/client";
export declare class WorkflowServices {
    static createWorkflow(name: string, description: string, stages: (string | {
        name: string;
        assessmentId?: string | null;
    })[], companyId: string): Promise<CreateWorkflowView>;
    static getAllCompanyWorkflows(companyId: string, status?: WorkflowStatus): Promise<CompanyWorkflowView[]>;
    static getWorkflowDetails(workflowId: string, companyId: string): Promise<GetWorkflowDetailsByIdView>;
    static updateWorkflow(workflowId: string, name: string, description: string | undefined, isDefault: boolean, stages: {
        stageLibraryId: string;
        order: number;
        assessmentId?: string | null;
    }[], companyId: string): Promise<GetWorkflowDetailsByIdView>;
    static deleteWorkflow(workflowId: string, companyId: string): Promise<void>;
    static setDefaultWorkflow(workflowId: string, companyId: string): Promise<GetWorkflowDetailsByIdView>;
}
//# sourceMappingURL=workflow.service.d.ts.map