import type { Request, Response } from "express";
import { AssessmentAttemptService } from "../services/assessmentAttempt.service.js";
import { asyncHandler } from "../../../common/helper/asyncHandler.js";
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { ApiResponse } from "../../../common/utils/ApiResponse.js";
import type { TokenParamDto } from "../dto/assessmentAttemp.dto.js";

export class AssessmentAttemptController {
    static startAssessment = asyncHandler(
        async (req: Request, res: Response) => {
            const { token } = req.params as unknown as TokenParamDto;

            const result = await AssessmentAttemptService.startAssessment(token);

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, "Assessment started successfully.", result)
            );
        }
    );
}
