import { ApplicationWorkflowRepository } from "../repositories/application-workflow.repository.js";
import { ApplicationRepository } from "../../application/repositories/application.repository.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { BadRequestError } from "../../../common/errors/BadRequestError.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { WorkflowRepository } from "../repositories/workflow.repository.js";

export class ApplicationWorkflowService {
    static async createApplicationWorkflow(
        applicationId: string,
        workflowStageId: string,
        movedByUserId?: string
    ): Promise<any> {
        const application = await ApplicationRepository.getAppliationById(applicationId);
        if (!application) {
            throw new NotFoundError("Application not found")
        }

        const workflowStage = await ApplicationWorkflowRepository.getWorkflowStageById(workflowStageId);
        if (!workflowStage) {
            throw new NotFoundError("Application stage not found")
        }

        const existingApplicationWorkflow = await ApplicationWorkflowRepository.getApplicationWorkflowByApplicationId(applicationId);
        if (existingApplicationWorkflow) {
            throw new ConflictError("Application workflow already exists")
        }

        if (application.job.workflowId !== workflowStage.workflowId) {
            throw new BadRequestError("The workflow stage does not belong to the application's workflow");
        }

        let movedByEmployerId: string | undefined = undefined;
        if (movedByUserId) {
            const employer = await ApplicationWorkflowRepository.findEmployerByUserId(movedByUserId);
            if (employer) {
                movedByEmployerId = employer.id;
            }
        }

        return await ApplicationWorkflowRepository.createApplicationWorkflow({
            applicationId,
            workflowStageId,
            ...(movedByEmployerId ? { movedByEmployerId } : {})
        });
    }
}