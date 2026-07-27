import { WorkflowRepository } from "../repositories/workflow.repository.js"
import { ForbiddenError } from "../../../common/errors/ForbiddenError.js"
import { NotFoundError } from "../../../common/errors/NotFoundError.js"
import { ConflictError } from "../../../common/errors/ConflictError.js"
import type { CreateWorkflowView } from "../interfaces/hiring-workflow.interface.js"

export class WorkflowServices{
    static async createWorkflow(
        name : string,
        description: string,
        stages:string[],
        companyId:string,
    ):Promise<CreateWorkflowView>{
        const nameAlreadyExists = await WorkflowRepository.findWorkflowNameExistingInCompany(
            name,
            companyId
        )

        if(nameAlreadyExists){
            throw new ConflictError("Workflow name already exists")
        }

        const workflow = await WorkflowRepository.createWorkflow(
            name,
            description,
            stages,
            companyId
        )

        return workflow;
    }
}