import { AssessmentAttemptService } from "../services/candidateAssessment.service.js";
import { asyncHandler } from "../../../common/helper/asyncHandler.js";
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { ApiResponse } from "../../../common/utils/ApiResponse.js";
export class AssessmentAttemptController {
    static startAssessment = asyncHandler(async (req, res) => {
        const { invitationToken } = req.body;
        const result = await AssessmentAttemptService.startAssessmentAttempt(req.user.id, invitationToken);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Assessment started successfully.", result));
    });
    static getAttempt = asyncHandler(async (req, res) => {
        const attemptId = req.params.attemptId;
        const result = await AssessmentAttemptService.getAttemptDetails(req.user.id, req.user.role, attemptId);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Assessment attempt retrieved successfully.", result));
    });
    static getCandidateAttempts = asyncHandler(async (req, res) => {
        const query = req.query;
        const filters = {};
        if (query.page !== undefined)
            filters.page = query.page;
        if (query.limit !== undefined)
            filters.limit = query.limit;
        if (query.status !== undefined)
            filters.status = query.status;
        const result = await AssessmentAttemptService.getCandidateAttempts(req.user.id, filters);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Candidate assessment attempts retrieved successfully.", result));
    });
    static resumeAttempt = asyncHandler(async (req, res) => {
        const attemptId = req.params.attemptId;
        const result = await AssessmentAttemptService.resumeAttempt(req.user.id, attemptId);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Assessment resumed successfully.", result));
    });
    static submitAttempt = asyncHandler(async (req, res) => {
        const attemptId = req.params.attemptId;
        const result = await AssessmentAttemptService.submitAttempt(req.user.id, attemptId);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Assessment submitted successfully.", result));
    });
    static saveAnswer = asyncHandler(async (req, res) => {
        const attemptId = req.params.attemptId;
        const questionId = req.params.questionId;
        const dto = req.body;
        const result = await AssessmentAttemptService.saveAnswer(req.user.id, attemptId, questionId, dto);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Answer saved successfully.", result));
    });
}
//# sourceMappingURL=candidateAssessment.controller.js.map