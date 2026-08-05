import type { Request, Response } from "express";
import { JobAssessmentService } from "../services/jobAssessment.service.js";
import { asyncHandler } from "../../../common/helper/asyncHandler.js";
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { ApiResponse } from "../../../common/utils/ApiResponse.js";
import type { AttachAssessmentsToJobDto, JobIdParamDto } from "../dto/jobAssessment.dto.js";

export class JobAssessmentController {
    static attachAssessmentsToJob = asyncHandler(
        async (req: Request, res: Response) => {
            const { jobId } = req.params as unknown as JobIdParamDto;
            const dto = req.body as AttachAssessmentsToJobDto;
            const user = req.user!; // Populated by authMiddleware

            const result = await JobAssessmentService.attachAssessmentsToJob(jobId, dto, user);

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, "Assessments attached successfully.", result)
            );
        }
    );
}
