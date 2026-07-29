import type { ApplicationWorkflow } from "@prisma/client";
import type { HiringBoardView } from "../interfaces/hiring-workflow.interface.js";
export declare class ApplicationWorkflowService {
    static createApplicationWorkflow(applicationId: string, workflowStageId: string, movedByUserId?: string): Promise<any>;
    static getHiringBoard(jobId: string): Promise<HiringBoardView[]>;
    static moveApplicationToNextStage(movedByUserId: string, applicationId: string, toworkflowStageId: string, remarks?: string, assignedTo?: string): Promise<ApplicationWorkflow>;
}
//# sourceMappingURL=application-workflow.service.d.ts.map