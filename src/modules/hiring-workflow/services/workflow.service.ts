import { WorkflowRepository } from "../repositories/workflow.repository.js"
import { ForbiddenError } from "../../../common/errors/ForbiddenError.js"
import { NotFoundError } from "../../../common/errors/NotFoundError.js"
import { ConflictError } from "../../../common/errors/ConflictError.js"
import type { CreateWorkflowView } from "../interfaces/hiring-workflow.interface.js"
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
    ): Promise<any> {
        const company = await CompanyRepository.findCompanyById(companyId);
        if (!company) {
            throw new NotFoundError("Company not exists");
        }

        const workflows = await WorkflowRepository.getWorkflowsByCompanyId(companyId, status);

        return workflows
    }
}