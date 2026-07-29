import type { ApplicationWorkflow } from "@prisma/client";
import type { HiringBoardView } from "../interfaces/hiring-workflow.interface.js";
export declare class ApplicationWorkflowService {
    static createApplicationWorkflow(applicationId: string, workflowStageId: string, movedByUserId?: string): Promise<any>;
    static getHiringBoard(jobId: string): Promise<HiringBoardView[]>;
    static moveApplicationToNextStage(movedByUserId: string, applicationId: string, toworkflowStageId: string, remarks?: string, assignedTo?: string): Promise<ApplicationWorkflow>;
    static bulkMoveApplicationsToNextStage(movedByUserId: string, applicationIds: string[], toworkflowStageId: string, remarks?: string, assignedTo?: string): Promise<ApplicationWorkflow[]>;
    static getCandidateWorkflow(applicationId: string): Promise<{
        currentStage: string;
        stages: Array<{
            name: string;
            status: string;
        }>;
    }>;
    static getWorkflowHistory(applicationId: string): Promise<{
        history: Array<{
            stage: string;
            action: string;
            performedBy: string;
            remarks: string;
            createdAt: Date;
        }>;
    }>;
}
//# sourceMappingURL=application-workflow.service.d.ts.map