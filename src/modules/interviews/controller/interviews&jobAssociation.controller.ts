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
        })
}
