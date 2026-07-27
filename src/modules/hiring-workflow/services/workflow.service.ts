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
        stages: string[],
        companyId: string,
    ): Promise<CreateWorkflowView> {
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
        status: WorkflowStatus
    ): Promise<CompanyWorkflowView[]> {
        const company = await CompanyRepository.findCompanyById(companyId);
        if (!company) {
            throw new NotFoundError("Company not exists");
        }

        const workflows = await WorkflowRepository.getWorkflowsByCompanyId(companyId, status);

        return workflows
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
}