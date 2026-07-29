import { WorkflowRepository } from "../repositories/workflow.repository.js";
import { ForbiddenError } from "../../../common/errors/ForbiddenError.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { CompanyRepository } from "../../company/repository/company.repository.js";
import { WorkflowStatus } from "@prisma/client";
export class WorkflowServices {
    static async createWorkflow(name, description, stages, companyId) {
        const nameAlreadyExists = await WorkflowRepository.findWorkflowNameExistingInCompany(name, companyId);
        if (nameAlreadyExists) {
            throw new ConflictError("Workflow name already exists");
        }
        const status = WorkflowStatus.ACTIVE;
        const workflow = await WorkflowRepository.createWorkflow(name, description, stages, companyId, status);
        return workflow;
    }
    static async getAllCompanyWorkflows(companyId, status) {
        const company = await CompanyRepository.findCompanyById(companyId);
        if (!company) {
            throw new NotFoundError("Company not exists");
        }
        const workflows = await WorkflowRepository.getWorkflowsByCompanyId(companyId, status);
        return workflows;
    }
    static async getWorkflowDetails(workflowId, companyId) {
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
        const workflowDetails = await WorkflowRepository.getWorkflowDetails(workflowId);
        if (!workflowDetails) {
            throw new NotFoundError("Workflow not exists");
        }
        return workflowDetails;
    }
    static async updateWorkflow(workflowId, name, description, isDefault, stages, companyId) {
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
        const nameAlreadyExists = await WorkflowRepository.findWorkflowNameExistingInCompany(name, companyId);
        if (nameAlreadyExists && nameAlreadyExists.id !== workflowId) {
            throw new ConflictError("Workflow name already exists");
        }
        const updatedWorkflow = await WorkflowRepository.updateWorkflow(workflowId, name, description, isDefault, stages, companyId);
        if (!updatedWorkflow) {
            throw new NotFoundError("Workflow not exists");
        }
        return updatedWorkflow;
    }
    static async deleteWorkflow(workflowId, companyId) {
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
    static async setDefaultWorkflow(workflowId, companyId) {
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
//# sourceMappingURL=workflow.service.js.map