import { StageType, WorkflowStatus } from "@prisma/client";

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

export interface GetWorkflowDetailsByIdView {
    id: string;
    companyId: string;
    name: string;
    description: string | null;
    status: WorkflowStatus;
    createdAt: Date;
    updatedAt: Date;
    stages: StageView[];
}

export interface StageView {
    id: string;
    workflowId: string;
    stageLibraryId: string;
    order?: number;
    stageLibrary: StageLibraryView;
}

export interface StageLibraryView {
    id: string;
    name: string;
    type: StageType;
}

export interface CompanyWorkflowView {
    id: string;
    name: string;
    description: string | null;
    status: WorkflowStatus;
    stages: StageView[];
}