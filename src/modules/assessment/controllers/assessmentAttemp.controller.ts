import type { Request, Response } from "express";
import { AssessmentAttemptService } from "../services/assessmentAttempt.service.js";
import { asyncHandler } from "../../../common/helper/asyncHandler.js";
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { ApiResponse } from "../../../common/utils/ApiResponse.js";
import type { StartAssessmentAttemptDto, GetAttemptsQueryDto } from "../dto/assessmentAttemp.dto.js";

export class AssessmentAttemptController {
    static startAssessment = asyncHandler(
        async (req: Request, res: Response) => {
            const { invitationToken } = req.body as StartAssessmentAttemptDto;

            const result = await AssessmentAttemptService.startAssessmentAttempt(req.user!.id, invitationToken);

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, "Assessment started successfully.", result)
            );
        }
    );

    static getAttempt = asyncHandler(
        async (req: Request, res: Response) => {
            const attemptId = req.params.attemptId as string;
            const result = await AssessmentAttemptService.getAttemptDetails(req.user!.id, req.user!.role, attemptId);

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, "Assessment attempt retrieved successfully.", result)
            );
        }
    );

    static getCandidateAttempts = asyncHandler(
        async (req: Request, res: Response) => {
            const query = req.query as unknown as GetAttemptsQueryDto;
            const filters: any = {};
            if (query.page !== undefined) filters.page = query.page;
            if (query.limit !== undefined) filters.limit = query.limit;
            if (query.status !== undefined) filters.status = query.status;

            const result = await AssessmentAttemptService.getCandidateAttempts(req.user!.id, filters);

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, "Candidate assessment attempts retrieved successfully.", result)
            );
        }
    );

    static resumeAttempt = asyncHandler(
        async (req: Request, res: Response) => {
            const attemptId = req.params.attemptId as string;

            const result = await AssessmentAttemptService.resumeAttempt(req.user!.id, attemptId);

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, "Assessment resumed successfully.", result)
            );
        }
    );

    static submitAttempt = asyncHandler(
        async (req: Request, res: Response) => {
            const attemptId = req.params.attemptId as string;

            const result = await AssessmentAttemptService.submitAttempt(req.user!.id, attemptId);

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, "Assessment submitted successfully.", result)
            );
        }
    );
}
