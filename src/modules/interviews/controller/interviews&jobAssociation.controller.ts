import type { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../../common/helper/asyncHandler.js";
import { InterviewsServices, JobInterviewsServices } from "../services/interviews&jobAssociation.service.js";
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
