import type { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../../common/helper/asyncHandler.js";
import { InterviewsServices, JobInterviewsServices, InterviewAssignmentsServices, InterviewSessionsServices, InterviewSessionParticipantsServices, InterviewEvaluationServices } from "../services/interviews.service.js";
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";

export class InterviewsController {
    static createInterview = asyncHandler(
        async (
            req: Request,
            res: Response
        ) => {
            const companyId = req.params.companyId;
            const companyMemberId = (req as any).companyMember?.id;

            if (!companyMemberId) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: "Unauthorized: Company member not found"
                });
            }

            const interview = await InterviewsServices.createInterview(
                companyId as string,
                companyMemberId,
                req.body
            );

            res.status(201).json({
                success: true,
                message: "Interview created successfully",
                data: interview
            });
        }
    );

    static getCompanyInterviews = asyncHandler(
        async (req: Request, res: Response) => {
            const companyId = req.params.companyId as string;
            const query = req.query;

            const result = await InterviewsServices.getCompanyInterviews(companyId, query);

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Interviews fetched successfully",
                data: result
            });
        }
    );

    static getInterviewById = asyncHandler(
        async (req: Request, res: Response) => {
            const companyId = req.params.companyId as string;
            const interviewId = req.params.interviewId as string;

            const interview = await InterviewsServices.getInterviewById(companyId, interviewId);

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Interview fetched successfully",
                data: interview
            });
        }
    );

    static updateInterview = asyncHandler(
        async (req: Request, res: Response) => {
            const companyId = req.params.companyId as string;
            const interviewId = req.params.interviewId as string;

            const updated = await InterviewsServices.updateInterview(companyId, interviewId, req.body);

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Interview updated successfully",
                data: updated
            });
        }
    );

    static changeInterviewStatus = asyncHandler(
        async (req: Request, res: Response) => {
            const companyId = req.params.companyId as string;
            const interviewId = req.params.interviewId as string;
            const { status } = req.body;

            const updated = await InterviewsServices.changeInterviewStatus(companyId, interviewId, status);

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: `Interview status changed to ${status} successfully`,
                data: updated
            });
        }
    );

    static deleteInterview = asyncHandler(
        async (req: Request, res: Response) => {
            const companyId = req.params.companyId as string;
            const interviewId = req.params.interviewId as string;

            const result = await InterviewsServices.deleteInterview(companyId, interviewId);

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: result.message,
                data: null
            });
        }
    );
}

export class JobInterviewsController {
    static attachInterview = asyncHandler(
        async (req: Request, res: Response) => {
            const companyId = req.params.companyId as string;
            const jobId = req.params.jobId as string;

            const result = await JobInterviewsServices.attachInterviewToJob(
                companyId,
                jobId,
                req.body
            );

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Interview attached to job successfully",
                data: result
            });
        }
    );

    static getInterviews = asyncHandler(
        async (req: Request, res: Response) => {
            const companyId = req.params.companyId as string;
            const jobId = req.params.jobId as string;

            const result = await JobInterviewsServices.getJobInterviews(companyId, jobId);

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Job interviews fetched successfully",
                data: result
            });
        }
    );

    static removeInterview = asyncHandler(
        async (req: Request, res: Response) => {
            const companyId = req.params.companyId as string;
            const jobId = req.params.jobId as string;
            const interviewId = req.params.interviewId as string;

            const result = await JobInterviewsServices.removeInterviewFromJob(
                companyId,
                jobId,
                interviewId
            );

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Interview removed from job successfully",
                data: result
            });
        }
    );

    static reorderInterviews = asyncHandler(
        async (req: Request, res: Response) => {
            const companyId = req.params.companyId as string;
            const jobId = req.params.jobId as string;

            const result = await JobInterviewsServices.reorderJobInterviews(
                companyId,
                jobId,
                req.body
            );

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Job interviews reordered successfully",
                data: result
            });
        }
    );

    static getAllJobInterviews = asyncHandler(
        async (req: Request, res: Response) => {
            const result = await JobInterviewsServices.getAllJobInterviews();

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "All job interviews fetched successfully",
                data: result
            });
        }
    );
}

export class InterviewAssignmentsController {
    static getEligibleCandidates = asyncHandler(
        async (req: Request, res: Response) => {
            const companyId = req.params.companyId as string;
            
            const result = await InterviewAssignmentsServices.getEligibleCandidates(companyId);

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Eligible candidates fetched successfully",
                data: result
            });
        }
    );
    static createAssignments = asyncHandler(
        async (req: Request, res: Response) => {
            const companyId = req.params.companyId as string;
            const companyMemberId = (req as any).companyMember?.id;
            const interviewId = req.params.interviewId as string;

            if (!companyMemberId) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: "Unauthorized: Company member not found"
                });
            }

            const assignments = await InterviewAssignmentsServices.createInterviewAssignments(
                companyId,
                companyMemberId,
                interviewId,
                req.body
            );

            return res.status(201).json({
                success: true,
                message: "Applications assigned to interview successfully",
                data: assignments
            });
        }
    );

    static getAssignments = asyncHandler(
        async (req: Request, res: Response) => {
            const companyId = req.params.companyId as string;
            const interviewId = req.params.interviewId as string;
            const query = req.query;

            const result = await InterviewAssignmentsServices.getInterviewAssignments(
                companyId,
                interviewId,
                query
            );

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Interview assignments fetched successfully",
                data: result.items,
                pagination: result.pagination
            });
        }
    );

    static getAssignmentById = asyncHandler(
        async (req: Request, res: Response) => {
            const companyId = req.params.companyId as string;
            const interviewId = req.params.interviewId as string;
            const assignmentId = req.params.assignmentId as string;

            const assignment = await InterviewAssignmentsServices.getInterviewAssignment(
                companyId,
                interviewId,
                assignmentId
            );

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Interview assignment fetched successfully",
                data: assignment
            });
        }
    );

    static async deleteAssignment(req: Request, res: Response) {
        const companyId = req.params.companyId as string;
        const interviewId = req.params.interviewId as string;
        const assignmentId = req.params.assignmentId as string;

        const result = await InterviewAssignmentsServices.deleteInterviewAssignment(
            companyId,
            interviewId,
            assignmentId
        );

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Interview assignment removed successfully",
            data: result
        });
    }
}

export class InterviewSessionsController {
    static createSession = asyncHandler(
        async (req: Request, res: Response) => {
            const companyId = req.params.companyId as string;
            const interviewId = req.params.interviewId as string;
            const companyMemberId = (req as any).companyMember?.id;

            if (!companyMemberId) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: "Unauthorized: Company member not found"
                });
            }

            const session = await InterviewSessionsServices.createSession(
                companyId,
                companyMemberId,
                interviewId,
                req.body
            );

            return res.status(201).json({
                success: true,
                message: "Interview session created successfully",
                data: session
            });
        }
    );

    static getSessions = asyncHandler(
        async (req: Request, res: Response) => {
            const companyId = req.params.companyId as string;
            const interviewId = req.params.interviewId as string;

            const sessions = await InterviewSessionsServices.getInterviewSessions(
                companyId,
                interviewId
            );

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Interview sessions fetched successfully",
                data: sessions
            });
        }
    );

    static getAllCompanySessions = asyncHandler(
        async (req: Request, res: Response) => {
            const companyId = req.params.companyId as string;

            const sessions = await InterviewSessionsServices.getAllCompanySessions(
                companyId
            );

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "All company interview sessions fetched successfully",
                data: sessions
            });
        }
    );

    static getSessionById = asyncHandler(
        async (req: Request, res: Response) => {
            const companyId = req.params.companyId as string;
            const sessionId = req.params.sessionId as string;

            const session = await InterviewSessionsServices.getSession(
                companyId,
                sessionId
            );

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Interview session fetched successfully",
                data: session
            });
        }
    );

    static updateSession = asyncHandler(
        async (req: Request, res: Response) => {
            const companyId = req.params.companyId as string;
            const sessionId = req.params.sessionId as string;

            const session = await InterviewSessionsServices.updateSession(
                companyId,
                sessionId,
                req.body
            );

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Interview session updated successfully",
                data: session
            });
        }
    );

    static startSession = asyncHandler(
        async (req: Request, res: Response) => {
            const companyId = req.params.companyId as string;
            const sessionId = req.params.sessionId as string;
            const userId = (req as any).user.id;

            const session = await InterviewSessionsServices.startSession(
                companyId,
                sessionId,
                userId
            );

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Interview session started successfully",
                data: session
            });
        }
    );

    static endSession = asyncHandler(
        async (req: Request, res: Response) => {
            const companyId = req.params.companyId as string;
            const sessionId = req.params.sessionId as string;
            const userId = (req as any).user.id;

            const session = await InterviewSessionsServices.endSession(
                companyId,
                sessionId,
                userId
            );

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Interview session ended successfully",
                data: session
            });
        }
    );
}

export class InterviewEvaluationController {
    static submitEvaluation = asyncHandler(
        async (req: Request, res: Response) => {
            const companyId = req.params.companyId as string;
            const sessionId = req.params.sessionId as string;
            const userId = (req as any).user.id;

            const evaluation = await InterviewEvaluationServices.submitEvaluation(
                companyId,
                sessionId,
                userId,
                req.body
            );

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Interview evaluation submitted successfully",
                data: evaluation
            });
        }
    );

    static getEvaluations = asyncHandler(
        async (req: Request, res: Response) => {
            const companyId = req.params.companyId as string;
            const sessionId = req.params.sessionId as string;
            const userId = (req as any).user.id;

            const evaluations = await InterviewEvaluationServices.getEvaluations(
                companyId,
                sessionId,
                userId
            );

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Interview evaluations fetched successfully",
                data: evaluations
            });
        }
    );
}

export class InterviewSessionParticipantsController {
    static addParticipants = asyncHandler(
        async (req: Request, res: Response) => {
            const companyId = req.params.companyId as string;
            const sessionId = req.params.sessionId as string;

            const participants = await InterviewSessionParticipantsServices.addParticipants(
                companyId,
                sessionId,
                req.body
            );

            return res.status(201).json({
                success: true,
                message: "Participants added successfully",
                data: participants
            });
        }
    );

    static getParticipants = asyncHandler(
        async (req: Request, res: Response) => {
            const companyId = req.params.companyId as string;
            const sessionId = req.params.sessionId as string;

            const participants = await InterviewSessionParticipantsServices.getParticipants(
                companyId,
                sessionId
            );

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Session participants fetched successfully",
                data: participants
            });
        }
    );

    static removeParticipant = asyncHandler(
        async (req: Request, res: Response) => {
            const companyId = req.params.companyId as string;
            const sessionId = req.params.sessionId as string;
            const participantId = req.params.participantId as string;

            await InterviewSessionParticipantsServices.removeParticipant(
                companyId,
                sessionId,
                participantId
            );

            return res.status(HTTP_STATUS.NO_CONTENT).send();
        }
    );
}

