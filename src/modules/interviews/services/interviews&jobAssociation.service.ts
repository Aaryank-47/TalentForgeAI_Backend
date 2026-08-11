import { InterviewsRepositories } from "../repositories/interviews&jobAssociation.repository.js";
import type { CreateInterviewDto, InterviewListQueryDto, UpdateInterviewDto } from "../dto/interviews&jobAssociation.dto.js";
import type { 
    InterviewResponse, 
    PaginatedInterviewResponse, 
    InterviewDetailResponse, 
    ArchiveInterviewResponse 
} from "../interfaces/interviews&jobAssociation.interface.js";
import { PaginationHelper } from "../../../common/helper/pagination.helper.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";

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

    static async getCompanyInterviews(
        companyId: string,
        query: InterviewListQueryDto
    ): Promise<PaginatedInterviewResponse> {
        const pagination = PaginationHelper.getPagination({
            page: query.page,
            limit: query.limit,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder
        });

        const filters: { status?: any; type?: any; mode?: any; search?: string } = {};
        if (query.status !== undefined) filters.status = query.status;
        if (query.type !== undefined) filters.type = query.type;
        if (query.mode !== undefined) filters.mode = query.mode;
        if (query.search !== undefined) filters.search = query.search;

        const { data, total } = await InterviewsRepositories.getCompanyInterviews(
            companyId,
            pagination,
            filters
        );

        const paginatedResult = PaginationHelper.buildResponse(data, pagination, total);
        
        return {
            items: paginatedResult.data,
            pagination: paginatedResult.pagination
        };
    }

    static async getInterviewById(
        companyId: string,
        interviewId: string
    ): Promise<InterviewDetailResponse> {
        const interview = await InterviewsRepositories.getInterviewById(companyId, interviewId);

        if (!interview) {
            throw new NotFoundError("Interview not found or does not belong to this company.");
        }

        const { jobInterviews, ...rest } = interview;

        const jobs = jobInterviews.map(ji => ({
            jobId: ji.jobId,
            title: ji.job.title,
            displayOrder: ji.displayOrder,
            isMandatory: ji.isMandatory
        }));

        return {
            ...rest,
            jobs
        };
    }

    static async updateInterview(
        companyId: string,
        interviewId: string,
        data: UpdateInterviewDto
    ): Promise<InterviewResponse> {
        const existing = await InterviewsRepositories.getInterviewById(companyId, interviewId);
        if (!existing) {
            throw new NotFoundError("Interview not found or does not belong to this company.");
        }

        const updateData: any = {};
        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.instructions !== undefined) updateData.instructions = data.instructions;
        if (data.type !== undefined) updateData.type = data.type;
        if (data.mode !== undefined) updateData.mode = data.mode;
        if (data.durationMinutes !== undefined) updateData.durationMinutes = data.durationMinutes;

        if (data.aiConfiguration) {
            updateData.aiConfiguration = {
                upsert: {
                    create: {
                        systemPrompt: data.aiConfiguration.systemPrompt,
                        evaluationMetrics: data.aiConfiguration.evaluationMetrics
                    },
                    update: {
                        systemPrompt: data.aiConfiguration.systemPrompt,
                        evaluationMetrics: data.aiConfiguration.evaluationMetrics
                    }
                }
            };
        }

        return InterviewsRepositories.updateInterview(companyId, interviewId, updateData);
    }

    static async archiveInterview(
        companyId: string,
        interviewId: string
    ): Promise<ArchiveInterviewResponse> {
        const existing = await InterviewsRepositories.getInterviewById(companyId, interviewId);
        if (!existing) {
            throw new NotFoundError("Interview not found or does not belong to this company.");
        }

        return InterviewsRepositories.archiveInterview(companyId, interviewId);
    }
}