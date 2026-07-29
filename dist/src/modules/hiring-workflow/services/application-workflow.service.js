import { ApplicationWorkflowRepository } from "../repositories/application-workflow.repository.js";
import { ApplicationRepository } from "../../application/repositories/application.repository.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { BadRequestError } from "../../../common/errors/BadRequestError.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { JobsRepository } from "../../jobs/repository/jobs.repository.js";
import { JobStatus } from "@prisma/client";
import { WorkflowRepository } from "../repositories/workflow.repository.js";
export class ApplicationWorkflowService {
    static async createApplicationWorkflow(applicationId, workflowStageId, movedByUserId) {
        const application = await ApplicationRepository.getAppliationById(applicationId);
        if (!application) {
            throw new NotFoundError("Application not found");
        }
        const workflowStage = await ApplicationWorkflowRepository.getWorkflowStageById(workflowStageId);
        if (!workflowStage) {
            throw new NotFoundError("Application stage not found");
        }
        const existingApplicationWorkflow = await ApplicationWorkflowRepository.getApplicationWorkflowByApplicationId(applicationId);
        if (existingApplicationWorkflow) {
            throw new ConflictError("Application workflow already exists");
        }
        if (application.job.workflowId !== workflowStage.workflowId) {
            throw new BadRequestError("The workflow stage does not belong to the application's workflow");
        }
        let movedByEmployerId = undefined;
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
    static async getHiringBoard(jobId) {
        const job = await JobsRepository.findJobById(jobId);
        if (!job) {
            throw new NotFoundError("Job not found");
        }
        if (job.status != JobStatus.PUBLISHED) {
            throw new BadRequestError("Job is not in PUBLISHED state");
        }
        if (!job.workflowId) {
            throw new NotFoundError("No workflow is assigned to this job");
        }
        const jobWorkflow = await WorkflowRepository.getWorkflowById(job.workflowId);
        if (!jobWorkflow) {
            throw new NotFoundError("Workflow not found");
        }
        const workflowStagesData = await WorkflowRepository.getWorkflowStagesByWorkflowId(job.workflowId);
        if (!workflowStagesData || !workflowStagesData.stages) {
            throw new NotFoundError("No workflow stages found for this job");
        }
        const stages = workflowStagesData.stages;
        // Fetch all applications (includes applicationWorkflow relation pre-fetched)
        const applications = await ApplicationRepository.getJobApplicationByJobId(jobId);
        // Construct the hiring board structure (stages ordered by order asc)
        const board = stages.map((stage) => ({
            stageId: stage.id,
            stageName: stage.stageLibrary.name,
            order: stage.order,
            applications: []
        }));
        // Map applications to their respective workflow stages
        for (const app of applications) {
            const workflowStageId = app.applicationWorkflow?.workflowStageId;
            const stageInBoard = board.find((s) => s.stageId === workflowStageId);
            if (stageInBoard) {
                stageInBoard.applications.push({
                    id: app.id,
                    candidateId: app.candidateId,
                    status: app.status,
                    appliedAt: app.appliedAt,
                    candidate: app.candidate
                });
            }
            else {
                // Fallback: place in the first stage of the workflow if no workflow stage is found
                if (board.length > 0) {
                    board[0].applications.push({
                        id: app.id,
                        candidateId: app.candidateId,
                        status: app.status,
                        appliedAt: app.appliedAt,
                        candidate: app.candidate
                    });
                }
            }
        }
        return board;
    }
}
//# sourceMappingURL=application-workflow.service.js.map