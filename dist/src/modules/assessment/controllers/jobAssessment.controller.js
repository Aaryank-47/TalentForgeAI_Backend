import { JobAssessmentService } from "../services/jobAssessment.service.js";
import { asyncHandler } from "../../../common/helper/asyncHandler.js";
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { ApiResponse } from "../../../common/utils/ApiResponse.js";
export class JobAssessmentController {
    static attachAssessmentsToJob = asyncHandler(async (req, res) => {
        const { jobId } = req.params;
        const dto = req.body;
        const user = req.user; // Populated by authMiddleware
        const result = await JobAssessmentService.attachAssessmentsToJob(jobId, dto, user);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Assessments attached successfully.", result));
    });
}
//# sourceMappingURL=jobAssessment.controller.js.map