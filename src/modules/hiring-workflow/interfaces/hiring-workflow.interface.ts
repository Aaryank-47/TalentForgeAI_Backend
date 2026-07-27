import { StageType } from "@prisma/client";

export interface CreateCustomStageInput {
    name: string;
    companyId?: string;
    type?: StageType;
}

export interface CreateCustomStageView{
    id: string;
    name: string;
    type: StageType;
    createdAt?: Date;
    updatedAt?: Date;
    companyId: string | null;
}

export interface CreateWorkflowInput {
    name: string;
    description: string;
    stages: string[];
    companyId: string;
}

export interface CreateWorkflowView {
    id: string;
    companyId: string;
    name: string;
    description: string | null;
    isDefault: boolean;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}