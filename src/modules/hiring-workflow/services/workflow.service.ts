import { WorkflowRepository } from "../repositories/workflow.repository.js"
import { ForbiddenError } from "../../../common/errors/ForbiddenError.js"
import { NotFoundError } from "../../../common/errors/NotFoundError.js"
import { ConflictError } from "../../../common/errors/ConflictError.js"
import type { CreateWorkflowView, GetWorkflowDetailsByIdView, CompanyWorkflowView } from "../interfaces/hiring-workflow.interface.js"
import { CompanyRepository } from "../../company/repository/company.repository.js"
import { WorkflowStatus } from "@prisma/client"

export class WorkflowServices {

    static async createWorkflow(
        name: string,
        description: string,
        stages: (string | { name: string; assessmentId?: string | null })[],
        companyId: string,
    ): Promise<CreateWorkflowView> {
        const assessmentIds = stages
            .map((stage) => (typeof stage !== "string" ? stage.assessmentId : null))
            .filter((id): id is string => !!id);

        if (assessmentIds.length > 0) {
            await WorkflowRepository.validateAssessments(assessmentIds, companyId);
        }

        const nameAlreadyExists = await WorkflowRepository.findWorkflowNameExistingInCompany(
            name,
            companyId
        )

        if (nameAlreadyExists) {
            throw new ConflictError("Workflow name already exists")
        }

        const status = WorkflowStatus.ACTIVE;

        const workflow = await WorkflowRepository.createWorkflow(
            name,
            description,
            stages,
            companyId,
            status
        )

        return workflow;
    }

    static async getAllCompanyWorkflows(
        companyId: string,
        status?: WorkflowStatus
    ): Promise<CompanyWorkflowView[]> {
        const company = await CompanyRepository.findCompanyById(companyId);
        if (!company) {
            throw new NotFoundError("Company not exists");
        }

        const workflows = await WorkflowRepository.getWorkflowsByCompanyId(companyId, status);

        return workflows;
    }

    static async getWorkflowDetails(
        workflowId: string,
        companyId : string
    ): Promise<GetWorkflowDetailsByIdView> {
        const company = await CompanyRepository.findCompanyById(companyId);
        if (!company) {
            throw new NotFoundError("Company not exists");
        }
        const workflow = await WorkflowRepository.getWorkflowById(workflowId);
        if (!workflow) {
            throw new NotFoundError("Workflow not exists");
        }
        if(workflow.companyId !== companyId){
            throw new ForbiddenError("You are not authorized to access this workflow");
        }
        
        const workflowDetails = await WorkflowRepository.getWorkflowDetails(workflowId);
        if (!workflowDetails) {
            throw new NotFoundError("Workflow not exists");
        }
        return workflowDetails
    }

    static async updateWorkflow(
        workflowId: string,
        name: string,
        description: string | undefined,
        isDefault: boolean,
        stages: { stageLibraryId: string; order: number; assessmentId?: string | null }[],
        companyId: string
    ): Promise<GetWorkflowDetailsByIdView> {
        const company = await CompanyRepository.findCompanyById(companyId);
        if (!company) {
            throw new NotFoundError("Company not exists");
        }

        const workflow = await WorkflowRepository.getWorkflowById(workflowId);
        if (!workflow) {
            throw new NotFoundError("Workflow not exists");
        }

        if (workflow.companyId !== companyId) {
            throw new ForbiddenError("You are not authorized to edit this workflow");
        }

        const assessmentIds = stages
            .map((stage) => stage.assessmentId)
            .filter((id): id is string => !!id);

        if (assessmentIds.length > 0) {
            await WorkflowRepository.validateAssessments(assessmentIds, companyId);
        }

        const nameAlreadyExists = await WorkflowRepository.findWorkflowNameExistingInCompany(
            name,
            companyId
        );
        if (nameAlreadyExists && nameAlreadyExists.id !== workflowId) {
            throw new ConflictError("Workflow name already exists");
        }

        const updatedWorkflow = await WorkflowRepository.updateWorkflow(
            workflowId,
            name,
            description,
            isDefault,
            stages,
            companyId
        );

        if (!updatedWorkflow) {
            throw new NotFoundError("Workflow not exists");
        }

        return updatedWorkflow;
    }

    static async deleteWorkflow(
        workflowId: string,
        companyId: string
    ): Promise<void> {
        const company = await CompanyRepository.findCompanyById(companyId);
        if (!company) {
            throw new NotFoundError("Company not exists");
        }

        const workflow = await WorkflowRepository.getWorkflowById(workflowId);
        if (!workflow) {
            throw new NotFoundError("Workflow not exists");
        }

        if (workflow.companyId !== companyId) {
            throw new ForbiddenError("You are not authorized to delete this workflow");
        }

        const isUsed = await WorkflowRepository.isWorkflowUsedInJobs(workflowId);
        if (isUsed) {
            throw new ConflictError("Cannot delete workflow because it is associated with jobs");
        }

        await WorkflowRepository.deleteWorkflow(workflowId);
    }

    static async setDefaultWorkflow(
        workflowId: string,
        companyId: string
    ): Promise<GetWorkflowDetailsByIdView> {
        const company = await CompanyRepository.findCompanyById(companyId);
        if (!company) {
            throw new NotFoundError("Company not exists");
        }

        const workflow = await WorkflowRepository.getWorkflowById(workflowId);
        if (!workflow) {
            throw new NotFoundError("Workflow not exists");
        }

        if (workflow.companyId !== companyId) {
            throw new ForbiddenError("You are not authorized to access this workflow");
        }

        const updatedWorkflow = await WorkflowRepository.setDefaultWorkflow(workflowId, companyId);
        if (!updatedWorkflow) {
            throw new NotFoundError("Workflow not exists");
        }

        return updatedWorkflow;
    }
}