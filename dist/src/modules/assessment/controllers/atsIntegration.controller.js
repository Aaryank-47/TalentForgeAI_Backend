import { AssessmentATSIntegrationService } from "../services/atsIntegration.service.js";
import { asyncHandler } from "../../../common/helper/asyncHandler.js";
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { ApiResponse } from "../../../common/utils/ApiResponse.js";
import { UserRole } from "@prisma/client";
export class ATSIntegrationController {
    static getAssessmentResultByApplication = asyncHandler(async (req, res) => {
        const applicationId = req.params.applicationId;
        const result = await AssessmentATSIntegrationService.getAssessmentResultByApplication(req.user.id, req.user.role, applicationId);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Assessment result retrieved successfully.", result));
    });
}
//# sourceMappingURL=atsIntegration.controller.js.map