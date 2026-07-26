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