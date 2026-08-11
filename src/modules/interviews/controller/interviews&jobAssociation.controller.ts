import type { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../../common/helper/asyncHandler.js";
import { InterviewsServices } from "../services/interviews&jobAssociation.service.js";
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

    static archiveInterview = asyncHandler(
        async (req: Request, res: Response) => {
            const companyId = req.params.companyId as string;
            const interviewId = req.params.interviewId as string;

            const archived = await InterviewsServices.archiveInterview(companyId, interviewId);

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Interview archived successfully",
                data: archived
            });
        }
    );
}
