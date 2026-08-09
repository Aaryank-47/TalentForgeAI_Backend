import type { Request, Response } from "express";
import { AssessmentATSIntegrationService } from "../services/atsIntegration.service.js";
import { asyncHandler } from "../../../common/helper/asyncHandler.js";
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { ApiResponse } from "../../../common/utils/ApiResponse.js";
import { UserRole } from "@prisma/client";

export class ATSIntegrationController {
    static getAssessmentResultByApplication = asyncHandler(
        async (req: Request, res: Response) => {
            const applicationId = req.params.applicationId as string;
            const result = await AssessmentATSIntegrationService.getAssessmentResultByApplication(
                req.user!.id,
                req.user!.role as UserRole,
                applicationId
            );

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, "Assessment result retrieved successfully.", result)
            );
        }
    );
}
