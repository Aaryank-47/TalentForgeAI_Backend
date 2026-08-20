import { InterviewsRepositories, JobInterviewsRepositories, InterviewAssignmentsRepositories, InterviewSessionsRepositories, InterviewSessionParticipantsRepositories } from "../repositories/interviews.repository.js";
import { ApplicationRepository } from "../../application/repositories/application.repository.js";
import { JobsRepository } from "../../jobs/repository/jobs.repository.js";
import { BadRequestError } from "../../../common/errors/BadRequestError.js";
import { PaginationHelper } from "../../../common/helper/pagination.helper.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ApplicationStatus, JobStatus, InterviewStatus, InterviewAssignmentCreationSource, InterviewSessionStatus, InterviewParticipantType } from "@prisma/client";
import prisma from "../../../config/database.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { CompanyRepository } from "../../company/repository/company.repository.js";
async function validateSessionParticipants(companyId, interviewId, assignments, members) {
    if (assignments.length > 0) {
        const dbAssignments = await prisma.interviewAssignment.findMany({
            where: { id: { in: assignments } }
        });
        if (dbAssignments.length !== assignments.length) {
            throw new NotFoundError("One or more assignments not found.");
        }
        for (const assignment of dbAssignments) {
            if (assignment.interviewId !== interviewId) {
                throw new BadRequestError(`Assignment ${assignment.id} does not belong to this interview.`);
            }
        }
    }
    if (members.length > 0) {
        const dbMembers = await CompanyRepository.findMembersByIds(members);
        if (dbMembers.length !== members.length) {
            throw new NotFoundError("One or more company members not found.");
        }
        for (const member of dbMembers) {
            if (member.companyId !== companyId) {
                throw new BadRequestError(`Company member ${member.id} does not belong to this company.`);
            }
        }
    }
}
export class InterviewsServices {
    static async createInterview(companyId, companyMemberId, data) {
        const interviewData = {
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
    static async getCompanyInterviews(companyId, query) {
        const pagination = PaginationHelper.getPagination({
            page: query.page,
            limit: query.limit,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder
        });
        const filters = {};
        if (query.status !== undefined)
            filters.status = query.status;
        if (query.type !== undefined)
            filters.type = query.type;
        if (query.mode !== undefined)
            filters.mode = query.mode;
        if (query.search !== undefined)
            filters.search = query.search;
        const { data, total } = await InterviewsRepositories.getCompanyInterviews(companyId, pagination, filters);
        const paginatedResult = PaginationHelper.buildResponse(data, pagination, total);
        return {
            items: paginatedResult.data,
            pagination: paginatedResult.pagination
        };
    }
    static async getInterviewById(companyId, interviewId) {
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
    static async updateInterview(companyId, interviewId, data) {
        const existing = await InterviewsRepositories.getInterviewById(companyId, interviewId);
        if (!existing) {
            throw new NotFoundError("Interview not found or does not belong to this company.");
        }
        const updateData = {};
        if (data.title !== undefined)
            updateData.title = data.title;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.instructions !== undefined)
            updateData.instructions = data.instructions;
        if (data.type !== undefined)
            updateData.type = data.type;
        if (data.mode !== undefined)
            updateData.mode = data.mode;
        if (data.durationMinutes !== undefined)
            updateData.durationMinutes = data.durationMinutes;
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
    static async changeInterviewStatus(companyId, interviewId, status) {
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
    static async attachInterviewToJob(companyId, jobId, data) {
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
        if (job.status !== JobStatus.DRAFT &&
            job.status !== JobStatus.PAUSED) {
            throw new BadRequestError("Interviews can only be attached to draft or paused jobs");
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
    static async getJobInterviews(companyId, jobId) {
        const job = await JobsRepository.findJobById(jobId);
        if (!job || job.companyId !== companyId) {
            throw new NotFoundError("Job not found or does not belong to this company");
        }
        return JobInterviewsRepositories.findJobInterviews(jobId);
    }
    static async removeInterviewFromJob(companyId, jobId, interviewId) {
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
    static async reorderJobInterviews(companyId, jobId, data) {
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
    static async getAllJobInterviews() {
        return JobInterviewsRepositories.findAllJobInterviews();
    }
}
export class InterviewAssignmentsServices {
    static async createInterviewAssignments(companyId, companyMemberId, interviewId, data) {
        const interview = await InterviewsRepositories.getInterviewById(companyId, interviewId);
        if (!interview) {
            throw new NotFoundError("Interview not found or does not belong to this company.");
        }
        if (interview.status !== InterviewStatus.ACTIVE) {
            throw new BadRequestError(`Cannot assign applications to an interview with status: ${interview.status}`);
        }
        const applicationIds = [...new Set(data.applicationIds)];
        const applications = await ApplicationRepository.getApplicationsByIds(applicationIds);
        if (applications.length !== applicationIds.length) {
            throw new NotFoundError("One or more applications not found.");
        }
        const validJobIds = new Set(interview.jobInterviews.map((j) => j.jobId));
        for (const app of applications) {
            if (!validJobIds.has(app.jobId)) {
                throw new BadRequestError(`Application ${app.id} belongs to Job ${app.job.title} which is not associated with this Interview.`);
            }
            if (app.status === ApplicationStatus.REJECTED ||
                app.status === ApplicationStatus.WITHDRAWN) {
                throw new BadRequestError(`Application ${app.id} is in an ineligible state: ${app.status}`);
            }
        }
        const existingAssignments = await InterviewAssignmentsRepositories.findExistingAssignments(interviewId, applicationIds);
        if (existingAssignments.length > 0) {
            const conflictIds = existingAssignments.map(ea => ea.applicationId).join(", ");
            throw new ConflictError(`Conflict: The following applications are already assigned to this interview: ${conflictIds}`);
        }
        const assignmentsData = applicationIds.map(appId => ({
            interviewId,
            applicationId: appId,
            creationSource: InterviewAssignmentCreationSource.MANUAL,
            assignedById: companyMemberId
        }));
        return InterviewAssignmentsRepositories.createInterviewAssignments(assignmentsData);
    }
    static async getInterviewAssignments(companyId, interviewId, query) {
        const interview = await InterviewsRepositories.getInterviewById(companyId, interviewId);
        if (!interview) {
            throw new NotFoundError("Interview not found or does not belong to this company.");
        }
        const pagination = PaginationHelper.getPagination({
            page: query.page,
            limit: query.limit
        });
        const { data, total } = await InterviewAssignmentsRepositories.findInterviewAssignments(interviewId, pagination);
        const paginatedResult = PaginationHelper.buildResponse(data, pagination, total);
        return {
            items: paginatedResult.data,
            pagination: paginatedResult.pagination
        };
    }
    static async getInterviewAssignment(companyId, interviewId, assignmentId) {
        const interview = await InterviewsRepositories.getInterviewById(companyId, interviewId);
        if (!interview) {
            throw new NotFoundError("Interview not found or does not belong to this company.");
        }
        const assignment = await InterviewAssignmentsRepositories.findInterviewAssignmentById(interviewId, assignmentId);
        if (!assignment) {
            throw new NotFoundError("Interview assignment not found for this interview.");
        }
        return assignment;
    }
    static async deleteInterviewAssignment(companyId, interviewId, assignmentId) {
        const interview = await InterviewsRepositories.getInterviewById(companyId, interviewId);
        if (!interview) {
            throw new NotFoundError("Interview not found or does not belong to this company.");
        }
        const assignment = await InterviewAssignmentsRepositories.findInterviewAssignmentById(interviewId, assignmentId);
        if (!assignment) {
            throw new NotFoundError("Interview assignment not found for this interview.");
        }
        await InterviewAssignmentsRepositories.deleteInterviewAssignment(assignmentId);
        return { assignmentId };
    }
}
export class InterviewSessionsServices {
    static async createSession(companyId, interviewId, data) {
        const interview = await InterviewsRepositories.getInterviewById(companyId, interviewId);
        if (!interview) {
            throw new NotFoundError("Interview not found or does not belong to this company.");
        }
        const assignments = data.assignmentIds ? [...new Set(data.assignmentIds)] : [];
        const members = data.companyMemberIds ? [...new Set(data.companyMemberIds)] : [];
        await validateSessionParticipants(companyId, interviewId, assignments, members);
        const participantsData = [
            ...assignments.map(id => ({
                participantType: InterviewParticipantType.CANDIDATE,
                assignmentId: id
            })),
            ...members.map(id => ({
                participantType: InterviewParticipantType.INTERVIEWER,
                companyMemberId: id
            }))
        ];
        return InterviewSessionsRepositories.createSessionWithParticipants({
            interviewId,
            scheduledAt: data.scheduledAt
        }, participantsData);
    }
    static async getInterviewSessions(companyId, interviewId) {
        const interview = await InterviewsRepositories.getInterviewById(companyId, interviewId);
        if (!interview) {
            throw new NotFoundError("Interview not found or does not belong to this company.");
        }
        return InterviewSessionsRepositories.findSessionsByInterviewId(interviewId);
    }
    static async getSession(companyId, sessionId) {
        const session = await InterviewSessionsRepositories.findSessionById(sessionId);
        if (!session) {
            throw new NotFoundError("Interview session not found.");
        }
        if (session.interview.companyId !== companyId) {
            throw new NotFoundError("Interview session not found or does not belong to this company.");
        }
        return session;
    }
    static async updateSession(companyId, sessionId, data) {
        const session = await InterviewSessionsRepositories.findSessionById(sessionId);
        if (!session) {
            throw new NotFoundError("Interview session not found.");
        }
        if (session.interview.companyId !== companyId) {
            throw new NotFoundError("Interview session not found or does not belong to this company.");
        }
        if (session.status !== InterviewSessionStatus.SCHEDULED) {
            throw new BadRequestError(`Cannot update schedule for a session with status: ${session.status}`);
        }
        const updateData = {};
        if (data.scheduledAt !== undefined) {
            updateData.scheduledAt = data.scheduledAt;
        }
        return InterviewSessionsRepositories.updateSession(sessionId, updateData);
    }
}
export class InterviewSessionParticipantsServices {
    static async addParticipants(companyId, sessionId, data) {
        const session = await InterviewSessionsRepositories.findSessionById(sessionId);
        if (!session) {
            throw new NotFoundError("Interview session not found.");
        }
        if (session.interview.companyId !== companyId) {
            throw new NotFoundError("Interview session not found or does not belong to this company.");
        }
        if (session.status !== InterviewSessionStatus.SCHEDULED) {
            throw new BadRequestError(`Cannot add participants to a session with status: ${session.status}`);
        }
        const assignments = data.assignmentIds ? [...new Set(data.assignmentIds)] : [];
        const members = data.companyMemberIds ? [...new Set(data.companyMemberIds)] : [];
        await validateSessionParticipants(companyId, session.interviewId, assignments, members);
        const participantsData = [
            ...assignments.map(id => ({
                sessionId,
                participantType: InterviewParticipantType.CANDIDATE,
                assignmentId: id
            })),
            ...members.map(id => ({
                sessionId,
                participantType: InterviewParticipantType.INTERVIEWER,
                companyMemberId: id
            }))
        ];
        try {
            return await InterviewSessionParticipantsRepositories.addParticipants(participantsData);
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new ConflictError("One or more participants are already in this session.");
            }
            throw error;
        }
    }
    static async getParticipants(companyId, sessionId) {
        const session = await InterviewSessionsRepositories.findSessionById(sessionId);
        if (!session) {
            throw new NotFoundError("Interview session not found.");
        }
        if (session.interview.companyId !== companyId) {
            throw new NotFoundError("Interview session not found or does not belong to this company.");
        }
        return InterviewSessionParticipantsRepositories.findSessionParticipants(sessionId);
    }
    static async removeParticipant(companyId, sessionId, participantId) {
        const session = await InterviewSessionsRepositories.findSessionById(sessionId);
        if (!session) {
            throw new NotFoundError("Interview session not found.");
        }
        if (session.interview.companyId !== companyId) {
            throw new NotFoundError("Interview session not found or does not belong to this company.");
        }
        if (session.status !== InterviewSessionStatus.SCHEDULED) {
            throw new BadRequestError(`Cannot remove participant from a session with status: ${session.status}`);
        }
        const participant = await InterviewSessionParticipantsRepositories.findParticipantById(participantId);
        if (!participant || participant.sessionId !== sessionId) {
            throw new NotFoundError("Participant not found in this session.");
        }
        await InterviewSessionParticipantsRepositories.deleteParticipant(participantId);
    }
    static async verifyAndJoinSession(userId, sessionId) {
        const participant = await InterviewSessionParticipantsRepositories.findParticipantForSession(userId, sessionId);
        if (!participant) {
            throw new NotFoundError("You are not authorized to join this interview");
        }
        const restrictedStatuses = ["COMPLETED", "CANCELLED", "EXPIRED"];
        if (restrictedStatuses.includes(participant.session.status)) {
            throw new BadRequestError(`Cannot join! Interview is already ${participant.session.status.toLowerCase()}`);
        }
        await InterviewSessionParticipantsRepositories.updateParticipantJoinedStatus(participant.id);
        return {
            participantId: participant.id,
            participantType: participant.participantType,
            sessionId: participant.sessionId,
            companyId: participant.session.interview.companyId
        };
    }
}
//# sourceMappingURL=interviews.service.js.map