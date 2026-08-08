import { StageType, WorkflowStatus } from "@prisma/client";
export interface CreateCustomStageInput {
    name: string;
    companyId?: string;
    type?: StageType;
}
export interface CreateCustomStageView {
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
    stages: (string | {
        name: string;
        assessmentId?: string | null;
    })[];
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
    assessmentId?: string | null;
    assessment?: {
        id: string;
        title: string;
        status: string;
    } | null;
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
export interface HiringBoardApplicationView {
    id: string;
    candidateId: string;
    status: string;
    appliedAt: Date;
    candidate: {
        id: string;
        fullName: string;
        user: {
            email: string;
        };
    };
}
export interface HiringBoardView {
    stageId: string;
    stageName: string;
    order: number;
    applications: HiringBoardApplicationView[];
}
//# sourceMappingURL=hiring-workflow.interface.d.ts.map