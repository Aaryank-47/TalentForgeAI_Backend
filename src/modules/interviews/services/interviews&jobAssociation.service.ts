import { InterviewsRepositories } from "../repositories/interviews&jobAssociation.repository.js";
import type { CreateInterviewDto } from "../dto/interviews&jobAssociation.dto.js";
import type { InterviewResponse } from "../interfaces/interviews&jobAssociation.interface.js";

export class InterviewsServices {
    static async createInterview(
        companyId: string,
        companyMemberId: string,
        data: CreateInterviewDto
    ): Promise<InterviewResponse> {

        const interviewData: any = {
            title: data.title,
            description: data.description,
            instructions: data.instructions,
            type: data.type,
            mode: data.mode,
            durationMinutes: data.durationMinutes,
            company: { connect: { id: companyId } },
            createdBy: { connect: { id: companyMemberId } },
            status: "DRAFT"
        };

        if (data.type === 'AI' && data.aiConfiguration) {
            interviewData.aiConfiguration = {
                create: {
                    systemPrompt: data.aiConfiguration.systemPrompt,
                    evaluationMetrics: data.aiConfiguration.evaluationMetrics
                }
            };
        }

        return InterviewsRepositories.createInterview(interviewData);
    }
}