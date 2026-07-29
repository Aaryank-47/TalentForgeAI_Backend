import type { HiringBoardView } from "../interfaces/hiring-workflow.interface.js";
export declare class ApplicationWorkflowService {
    static createApplicationWorkflow(applicationId: string, workflowStageId: string, movedByUserId?: string): Promise<any>;
    static getHiringBoard(jobId: string): Promise<HiringBoardView[]>;
}
//# sourceMappingURL=application-workflow.service.d.ts.map