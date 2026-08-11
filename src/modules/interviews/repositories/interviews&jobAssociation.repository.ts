import type { CreateInterviewDto } from "../dto/interviews&jobAssociation.dto.js";
import prisma from "../../../config/database.js";
import type { Prisma } from "@prisma/client";
import { interviewSelect, type InterviewResponse } from "../interfaces/interviews&jobAssociation.interface.js";

export class InterviewsRepositories {
    static async createInterview(data: Prisma.InterviewCreateInput): Promise<InterviewResponse> {
        return prisma.interview.create({
            data,
            select: interviewSelect
        });
    }
}