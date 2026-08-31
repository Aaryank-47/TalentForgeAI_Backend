import { InterviewsRepositories, JobInterviewsRepositories, InterviewAssignmentsRepositories, InterviewSessionsRepositories, InterviewSessionParticipantsRepositories, InterviewEvaluationRepositories } from "../repositories/interviews.repository.js";
import { ApplicationRepository } from "../../application/repositories/application.repository.js";
import { JobsRepository } from "../../jobs/repository/jobs.repository.js";
import { BadRequestError } from "../../../common/errors/BadRequestError.js";
import { PaginationHelper } from "../../../common/helper/pagination.helper.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ApplicationStatus, JobStatus, InterviewStatus, InterviewAssignmentCreationSource, InterviewSessionStatus, InterviewParticipantType } from "@prisma/client";
import prisma from "../../../config/database.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { ForbiddenError } from "../../../common/errors/ForbiddenError.js";
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
            status: data.status || "DRAFT"
        };
        if (data.type === 'AI' && data.aiConfiguration) {
            interviewData.aiConfiguration = {
                create: {
                    systemPrompt: data.aiConfiguration.systemPrompt,
                    evaluationMetrics: data.aiConfiguration.evaluationMetrics,
                    ...(data.aiConfiguration.questionCount !== undefined && { questionCount: data.aiConfiguration.questionCount }),
                    ...(data.aiConfiguration.difficulty !== undefined && { difficulty: data.aiConfiguration.difficulty }),
                    ...(data.aiConfiguration.allowFollowUps !== undefined && { allowFollowUps: data.aiConfiguration.allowFollowUps }),
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
        if (data.status !== undefined)
            updateData.status = data.status;
        if (data.durationMinutes !== undefined)
            updateData.durationMinutes = data.durationMinutes;
        if (data.aiConfiguration) {
            const aiConfData = {};
            if (data.aiConfiguration.systemPrompt !== undefined)
                aiConfData.systemPrompt = data.aiConfiguration.systemPrompt;
            if (data.aiConfiguration.evaluationMetrics !== undefined)
                aiConfData.evaluationMetrics = data.aiConfiguration.evaluationMetrics;
            if (data.aiConfiguration.questionCount !== undefined)
                aiConfData.questionCount = data.aiConfiguration.questionCount;
            if (data.aiConfiguration.difficulty !== undefined)
                aiConfData.difficulty = data.aiConfiguration.difficulty;
            if (data.aiConfiguration.allowFollowUps !== undefined)
                aiConfData.allowFollowUps = data.aiConfiguration.allowFollowUps;
            updateData.aiConfiguration = {
                upsert: {
                    create: aiConfData,
                    update: aiConfData
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
    static async deleteInterview(companyId, interviewId) {
        const existing = await InterviewsRepositories.getInterviewById(companyId, interviewId);
        if (!existing) {
            throw new NotFoundError("Interview not found or does not belong to this company.");
        }
        // Clean up any JobInterview associations before deleting
        await JobInterviewsRepositories.deleteAllJobInterviewsByInterviewId(interviewId);
        await InterviewsRepositories.deleteInterview(companyId, interviewId);
        return { message: "Interview deleted successfully" };
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
    static async getEligibleCandidates(companyId) {
        return InterviewAssignmentsRepositories.findEligibleCandidates(companyId);
    }
    static async createInterviewAssignments(companyId, companyMemberId, interviewId, data) {
        const interview = await InterviewsRepositories.getInterviewById(companyId, interviewId);
        if (!interview) {
            throw new NotFoundError("Interview not found or does not belong to this company.");
        }
        if (interview.status !== InterviewStatus.ACTIVE) {
            await InterviewsRepositories.updateInterview(companyId, interviewId, {
                status: InterviewStatus.ACTIVE
            });
            interview.status = InterviewStatus.ACTIVE;
        }
        const applicationIds = [...new Set(data.applicationIds)];
        const applications = await ApplicationRepository.getApplicationsByIds(applicationIds);
        if (applications.length !== applicationIds.length) {
            throw new NotFoundError("One or more applications not found.");
        }
        const validJobIds = new Set(interview.jobInterviews.map((j) => j.jobId));
        for (const appItem of applications) {
            const app = appItem;
            // Auto-associate job with interview if in same company
            if (!validJobIds.has(app.jobId)) {
                const isAttached = await JobInterviewsRepositories.findJobInterview(app.jobId, interviewId);
                if (!isAttached) {
                    await JobInterviewsRepositories.createJobInterview({
                        jobId: app.jobId,
                        interviewId,
                        displayOrder: 0,
                        isMandatory: true
                    });
                    validJobIds.add(app.jobId);
                }
            }
            if (app.status === ApplicationStatus.REJECTED ||
                app.status === ApplicationStatus.WITHDRAWN) {
                throw new BadRequestError(`Application ${app.id} is in an ineligible state: ${app.status}`);
            }
            // --- Workflow & Stage Inspection --- //
            const workflow = app.job?.workflow;
            if (workflow && workflow.stages && workflow.stages.length > 0) {
                // 1. Check if the workflow contains an AI Interview stage
                const aiInterviewStage = workflow.stages.find((s) => {
                    const name = s.stageLibrary?.name?.toLowerCase() || "";
                    return s.interviewId === interviewId ||
                        name.includes("ai interview") ||
                        name.includes("ai technical") ||
                        name.includes("ai screening") ||
                        name.includes("interview");
                });
                if (!aiInterviewStage) {
                    throw new BadRequestError(`The workflow for job "${app.job?.title}" does not have an AI Interview stage.`);
                }
                // 2. Check if candidate has reached the AI Interview stage
                const currentStage = app.applicationWorkflow?.workflowStage;
                if (!currentStage) {
                    const initialStage = workflow.stages[0];
                    if (initialStage && initialStage.id !== aiInterviewStage.id && initialStage.order < aiInterviewStage.order) {
                        const candidateName = app.candidate?.fullName || app.candidate?.user?.email || "Candidate";
                        throw new BadRequestError(`${candidateName} has not reached the AI Interview stage yet. Current workflow stage is: "${initialStage.stageLibrary?.name || 'Applied'}". Please move the candidate to the AI Interview stage before assigning.`);
                    }
                }
                else {
                    if (currentStage.order < aiInterviewStage.order && currentStage.id !== aiInterviewStage.id) {
                        const candidateName = app.candidate?.fullName || app.candidate?.user?.email || "Candidate";
                        throw new BadRequestError(`${candidateName} has not reached the AI Interview stage yet. Current workflow stage is: "${currentStage.stageLibrary?.name || 'Applied'}" (Stage order ${currentStage.order}, AI Interview is Stage ${aiInterviewStage.order}). Please move the candidate to the AI Interview stage before assigning.`);
                    }
                }
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
    static async createSession(companyId, companyMemberId, interviewId, data) {
        const interview = await InterviewsRepositories.getInterviewById(companyId, interviewId);
        if (!interview) {
            throw new NotFoundError("Interview not found or does not belong to this company.");
        }
        let assignments = data.assignmentIds ? [...new Set(data.assignmentIds)] : [];
        const applicationIds = data.applicationIds ? [...new Set(data.applicationIds)] : [];
        const members = data.companyMemberIds ? [...new Set(data.companyMemberIds)] : [];
        // If application IDs are provided, create assignments for them if they don't exist
        if (applicationIds.length > 0) {
            // Check for existing assignments
            const existingAssignments = await InterviewAssignmentsRepositories.findExistingAssignments(interviewId, applicationIds);
            const existingAppIds = new Set(existingAssignments.map(ea => ea.applicationId));
            const newAppIds = applicationIds.filter(appId => !existingAppIds.has(appId));
            let newAssignments = [];
            if (newAppIds.length > 0) {
                const assignmentsData = newAppIds.map(appId => ({
                    interviewId,
                    applicationId: appId,
                    creationSource: "MANUAL",
                    assignedById: companyMemberId
                }));
                newAssignments = await InterviewAssignmentsRepositories.createInterviewAssignments(assignmentsData);
            }
            // Collect all assignment IDs
            const allAssignmentIds = [
                ...existingAssignments.map(ea => ea.id),
                ...newAssignments.map(na => na.id)
            ];
            assignments = [...new Set([...assignments, ...allAssignmentIds])];
        }
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
    static async expireOverdueSessions(companyId) {
        try {
            const now = new Date();
            const scheduledSessions = await prisma.interviewSession.findMany({
                where: {
                    status: InterviewSessionStatus.SCHEDULED,
                    startedAt: null,
                    ...(companyId && companyId !== 'company' && companyId !== 'default' ? { interview: { companyId } } : {})
                },
                include: {
                    interview: {
                        select: { durationMinutes: true }
                    },
                    participants: {
                        select: { hasJoined: true }
                    }
                }
            });
            const overdueIds = [];
            for (const s of scheduledSessions) {
                const durationMin = s.interview?.durationMinutes || 45;
                const scheduledEndTime = new Date(new Date(s.scheduledAt).getTime() + durationMin * 60 * 1000);
                const nobodyJoined = s.participants.length === 0 || s.participants.every(p => !p.hasJoined);
                if (now > scheduledEndTime && nobodyJoined) {
                    overdueIds.push(s.id);
                }
            }
            if (overdueIds.length > 0) {
                await prisma.interviewSession.updateMany({
                    where: { id: { in: overdueIds } },
                    data: { status: InterviewSessionStatus.EXPIRED }
                });
            }
        }
        catch (err) {
            console.error("Error expiring overdue sessions:", err);
        }
    }
    static initAutoExpiryScheduler(intervalMs = 60 * 1000) {
        // Run immediately on start
        InterviewSessionsServices.expireOverdueSessions().catch(err => {
            console.error("[InterviewAutoExpiry] Initial run error:", err);
        });
        // Run periodically
        const timer = setInterval(() => {
            InterviewSessionsServices.expireOverdueSessions().catch(err => {
                console.error("[InterviewAutoExpiry] Periodic check error:", err);
            });
        }, intervalMs);
        timer.unref(); // Prevent timer from blocking server shutdown
        return timer;
    }
    static async getInterviewSessions(companyId, interviewId) {
        await InterviewSessionsServices.expireOverdueSessions(companyId);
        const interview = await InterviewsRepositories.getInterviewById(companyId, interviewId);
        if (!interview) {
            throw new NotFoundError("Interview not found or does not belong to this company.");
        }
        return InterviewSessionsRepositories.findSessionsByInterviewId(interviewId);
    }
    static async getAllCompanySessions(companyId) {
        await InterviewSessionsServices.expireOverdueSessions(companyId);
        return InterviewSessionsRepositories.findSessionsByCompanyId(companyId);
    }
    static async getSession(companyId, sessionId) {
        await InterviewSessionsServices.expireOverdueSessions(companyId);
        const session = await InterviewSessionsRepositories.findSessionById(sessionId);
        if (!session) {
            throw new NotFoundError("Interview session not found.");
        }
        const effectiveCompanyId = (companyId && companyId !== 'company' && companyId !== 'default')
            ? companyId
            : session.interview.companyId;
        if (session.interview.companyId !== effectiveCompanyId) {
            throw new NotFoundError("Interview session not found or does not belong to this company.");
        }
        return session;
    }
    static async updateSession(companyId, sessionId, data) {
        const session = await InterviewSessionsRepositories.findSessionById(sessionId);
        if (!session) {
            throw new NotFoundError("Interview session not found.");
        }
        const effectiveCompanyId = (companyId && companyId !== 'company' && companyId !== 'default')
            ? companyId
            : session.interview.companyId;
        if (session.interview.companyId !== effectiveCompanyId) {
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
    static async cancelSession(companyId, sessionId, userId) {
        const session = await InterviewSessionsRepositories.findSessionById(sessionId);
        if (!session) {
            throw new NotFoundError("Interview session not found.");
        }
        const effectiveCompanyId = (companyId && companyId !== 'company' && companyId !== 'default')
            ? companyId
            : session.interview.companyId;
        if (session.interview.companyId !== effectiveCompanyId) {
            throw new NotFoundError("Interview session not found or does not belong to this company.");
        }
        const member = await CompanyRepository.findMemberByUserAndCompany(userId, effectiveCompanyId);
        if (!member) {
            throw new ForbiddenError("You are not authorized to cancel this session.");
        }
        if (session.status === InterviewSessionStatus.COMPLETED) {
            throw new BadRequestError("Cannot cancel a completed interview session.");
        }
        return InterviewSessionsRepositories.updateSession(sessionId, {
            status: InterviewSessionStatus.CANCELLED
        });
    }
    static async startSession(companyId, sessionId, userId) {
        const session = await InterviewSessionsRepositories.findSessionById(sessionId);
        if (!session) {
            throw new NotFoundError("Interview session not found.");
        }
        const effectiveCompanyId = (companyId && companyId !== 'company' && companyId !== 'default')
            ? companyId
            : session.interview.companyId;
        if (session.interview.companyId !== effectiveCompanyId) {
            throw new NotFoundError("Interview session not found or does not belong to this company.");
        }
        const member = await CompanyRepository.findMemberByUserAndCompany(userId, effectiveCompanyId);
        if (!member) {
            throw new ForbiddenError("You are not authorized to start this session.");
        }
        if (session.status !== InterviewSessionStatus.SCHEDULED) {
            throw new BadRequestError(`Cannot start a session with status: ${session.status}`);
        }
        return InterviewSessionsRepositories.updateSession(sessionId, {
            status: InterviewSessionStatus.IN_PROGRESS,
            startedAt: new Date()
        });
    }
    static async endSession(companyId, sessionId, userId) {
        const session = await InterviewSessionsRepositories.findSessionById(sessionId);
        if (!session) {
            throw new NotFoundError("Interview session not found.");
        }
        const effectiveCompanyId = (companyId && companyId !== 'company' && companyId !== 'default')
            ? companyId
            : session.interview.companyId;
        if (session.interview.companyId !== effectiveCompanyId) {
            throw new NotFoundError("Interview session not found or does not belong to this company.");
        }
        const member = await CompanyRepository.findMemberByUserAndCompany(userId, effectiveCompanyId);
        if (!member) {
            throw new ForbiddenError("You are not authorized to end this session.");
        }
        if (session.status !== InterviewSessionStatus.IN_PROGRESS) {
            throw new BadRequestError(`Cannot end a session with status: ${session.status}`);
        }
        return InterviewSessionsRepositories.updateSession(sessionId, {
            status: InterviewSessionStatus.COMPLETED,
            endedAt: session.endedAt || new Date()
        });
    }
}
export class InterviewEvaluationServices {
    static async submitEvaluation(companyId, sessionId, userId, data) {
        const session = await InterviewSessionsRepositories.findSessionById(sessionId);
        if (!session) {
            throw new NotFoundError("Interview session not found.");
        }
        const effectiveCompanyId = (companyId && companyId !== 'company' && companyId !== 'default')
            ? companyId
            : session.interview.companyId;
        if (session.interview.companyId !== effectiveCompanyId) {
            throw new NotFoundError("Interview session not found or does not belong to this company.");
        }
        const member = await CompanyRepository.findMemberByUserAndCompany(userId, effectiveCompanyId);
        if (!member) {
            throw new ForbiddenError("Only authorized company interviewers can submit evaluations.");
        }
        // Auto-complete session on evaluation submission if not already completed
        if (session.status !== InterviewSessionStatus.COMPLETED) {
            await InterviewSessionsRepositories.updateSession(sessionId, {
                status: InterviewSessionStatus.COMPLETED,
                endedAt: session.endedAt || new Date()
            });
        }
        return InterviewEvaluationRepositories.upsertEvaluation(sessionId, member.id, {
            overallScore: data.overallScore,
            communicationScore: data.communicationScore ?? null,
            technicalScore: data.technicalScore ?? null,
            problemSolvingScore: data.problemSolvingScore ?? null,
            behaviourScore: data.behaviourScore ?? null,
            cultureFitScore: data.cultureFitScore ?? null,
            strengths: data.strengths ?? [],
            improvements: data.improvements ?? [],
            comments: data.comments ?? null,
            recommendation: data.recommendation ?? null
        });
    }
    static async getEvaluations(companyId, sessionId, userId) {
        const session = await InterviewSessionsRepositories.findSessionById(sessionId);
        if (!session) {
            throw new NotFoundError("Interview session not found.");
        }
        const effectiveCompanyId = (companyId && companyId !== 'company' && companyId !== 'default')
            ? companyId
            : session.interview.companyId;
        if (session.interview.companyId !== effectiveCompanyId) {
            throw new NotFoundError("Interview session not found or does not belong to this company.");
        }
        const member = await CompanyRepository.findMemberByUserAndCompany(userId, effectiveCompanyId);
        if (!member) {
            const participant = await InterviewSessionParticipantsRepositories.findParticipantForSession(userId, sessionId);
            if (!participant) {
                throw new ForbiddenError("You are not authorized to view evaluations for this session.");
            }
        }
        return InterviewEvaluationRepositories.findSessionEvaluations(sessionId);
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
        // Candidates can only join if the interviewer has started the interview session
        if (participant.participantType === 'CANDIDATE' && participant.session.status !== 'IN_PROGRESS') {
            throw new BadRequestError("Interview has not started by the interviewer");
        }
        await InterviewSessionParticipantsRepositories.updateParticipantJoinedStatus(participant.id);
        const name = participant.companyMember?.user?.employer?.fullName || participant.companyMember?.user?.admin?.fullName || participant.assignment?.application?.candidate?.fullName || "User";
        const initials = name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
        const avatarColor = participant.participantType === 'INTERVIEWER' ? 'from-blue-500 to-blue-700' : 'from-purple-500 to-purple-700';
        return {
            participantId: participant.id,
            participantType: participant.participantType,
            sessionId: participant.sessionId,
            companyId: participant.session.interview.companyId,
            name,
            initials,
            avatarColor
        };
    }
}
//# sourceMappingURL=interviews.service.js.map