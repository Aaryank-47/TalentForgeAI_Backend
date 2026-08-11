import { InterviewsRepositories, JobInterviewsRepositories } from "../repositories/interviews&jobAssociation.repository.js";
import type { CreateInterviewDto, InterviewListQueryDto, UpdateInterviewDto, AttachInterviewToJobRequest, ReorderJobInterviewsRequest } from "../dto/interviews&jobAssociation.dto.js";
import type {
    InterviewResponse,
    PaginatedInterviewResponse,
    InterviewDetailResponse,
    ArchiveInterviewResponse,
    JobInterviewResponse,
    JobInterviewWithInterviewResponse,
    RemoveJobInterviewResponse
} from "../interfaces/interviews&jobAssociation.interface.js";
import { JobsRepository } from "../../jobs/repository/jobs.repository.js";
import { BadRequestError } from "../../../common/errors/BadRequestError.js";
import { PaginationHelper } from "../../../common/helper/pagination.helper.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { JobStatus, InterviewStatus } from "@prisma/client";

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

    static async changeInterviewStatus(
        companyId: string,
        interviewId: string,
        status: InterviewStatus
    ) {
        const existing = await InterviewsRepositories.getInterviewById(companyId, interviewId);
        if (!existing) {
            throw new NotFoundError("Interview not found or does not belong to this company.");
        }

        if (status === InterviewStatus.ARCHIVED) {
            // Delete all JobInterview associations for this interview to prevent broken references
            await JobInterviewsRepositories.deleteAllJobInterviewsByInterviewId(interviewId);
        }

        return InterviewsRepositories.changeInterviewStatus(companyId, interviewId, status);
    }
}

export class JobInterviewsServices {
    static async attachInterviewToJob(
        companyId: string,
        jobId: string,
        data: AttachInterviewToJobRequest
    ): Promise<JobInterviewResponse> {
        const job = await JobsRepository.findJobById(jobId);
        if (!job || job.companyId !== companyId) {
            throw new NotFoundError("Job not found or does not belong to this company");
        }

        const interview = await InterviewsRepositories.getInterviewById(companyId, data.interviewId);
        if (!interview) {
            throw new NotFoundError("Interview not found or does not belong to this company");
        }
        if (interview.status == InterviewStatus.ARCHIVED) {
            throw new BadRequestError("Interview is Archived");
        }
        if (interview.status == InterviewStatus.DRAFT) {
            throw new BadRequestError("Interview is in Draft Mode");
        }

        if (
            job.status !== JobStatus.DRAFT &&
            job.status !== JobStatus.PAUSED
        ) {
            throw new BadRequestError(
                "Interviews can only be attached to draft or paused jobs"
            );
        }

        const existing = await JobInterviewsRepositories.findJobInterview(jobId, data.interviewId);
        if (existing) {
            throw new BadRequestError("Interview is already attached to this job");
        }

        let displayOrder = data.displayOrder;
        if (displayOrder === undefined) {
            const lastJobInterview = await JobInterviewsRepositories.findLastJobInterview(jobId);
            displayOrder = lastJobInterview ? lastJobInterview.displayOrder + 1 : 1;
        }

        return JobInterviewsRepositories.createJobInterview({
            jobId,
            interviewId: data.interviewId,
            displayOrder,
            isMandatory: data.isMandatory ?? false
        });
    }

    static async getJobInterviews(
        companyId: string,
        jobId: string
    ): Promise<JobInterviewWithInterviewResponse[]> {
        const job = await JobsRepository.findJobById(jobId);
        if (!job || job.companyId !== companyId) {
            throw new NotFoundError("Job not found or does not belong to this company");
        }

        return JobInterviewsRepositories.findJobInterviews(jobId);
    }

    static async removeInterviewFromJob(
        companyId: string,
        jobId: string,
        interviewId: string
    ): Promise<RemoveJobInterviewResponse> {
        const job = await JobsRepository.findJobById(jobId);
        if (!job || job.companyId !== companyId) {
            throw new NotFoundError("Job not found or does not belong to this company");
        }

        const existing = await JobInterviewsRepositories.findJobInterview(jobId, interviewId);
        if (!existing) {
            throw new NotFoundError("JobInterview association not found");
        }

        return JobInterviewsRepositories.deleteJobInterview(jobId, interviewId);
    }

    static async reorderJobInterviews(
        companyId: string,
        jobId: string,
        data: ReorderJobInterviewsRequest
    ): Promise<JobInterviewWithInterviewResponse[]> {
        const job = await JobsRepository.findJobById(jobId);
        if (!job || job.companyId !== companyId) {
            throw new NotFoundError("Job not found or does not belong to this company");
        }

        const displayOrders = data.interviews.map(i => i.displayOrder);
        const uniqueDisplayOrders = new Set(displayOrders);
        if (displayOrders.length !== uniqueDisplayOrders.size) {
            throw new BadRequestError("Duplicate displayOrder values are not allowed");
        }

        const existingInterviews = await JobInterviewsRepositories.findJobInterviews(jobId);
        const existingIds = existingInterviews.map(ei => ei.interviewId);

        for (const item of data.interviews) {
            if (!existingIds.includes(item.interviewId)) {
                throw new BadRequestError(`Interview ${item.interviewId} is not attached to this job`);
            }
        }

        await JobInterviewsRepositories.updateJobInterviewOrders(jobId, data.interviews);
        return JobInterviewsRepositories.findJobInterviews(jobId);
    }

    static async getAllJobInterviews(): Promise<any> {
        return JobInterviewsRepositories.findAllJobInterviews();
    }
}