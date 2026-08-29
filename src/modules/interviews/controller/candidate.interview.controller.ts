import type { Request, Response } from "express";
import { asyncHandler } from "../../../common/helper/asyncHandler.js";
import { CandidateInterviewService } from "../services/candidate.interview.service.js";
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";

export class CandidateInterviewController {
    static getMyInterviews = asyncHandler(
        async (req: Request, res: Response) => {
            const user = req.user!;
            const type = req.query.type as string | undefined;
            const data = await CandidateInterviewService.getMyInterviews(user.id, type);

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Candidate interviews fetched successfully",
                data
            });
        }
    );

    static getSessionDetails = asyncHandler(
        async (req: Request, res: Response) => {
            const user = req.user!;
            const { sessionId } = req.params;

            const data = await CandidateInterviewService.getSessionDetails(user.id, sessionId as string);

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Interview session details fetched successfully",
                data
            });
        }
    );
}
