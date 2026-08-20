import { AssessmentEvaluationService } from "../services/assessmentEvaluation.service.js";
import { asyncHandler } from "../../../common/helper/asyncHandler.js";
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { ApiResponse } from "../../../common/utils/ApiResponse.js";
import { UserRole } from "@prisma/client";
export class AssessmentEvaluationController {
    static startEvaluation = asyncHandler(async (req, res) => {
        const attemptId = req.params.attemptId;
        const result = await AssessmentEvaluationService.startEvaluation(req.user.id, attemptId);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Assessment evaluation started successfully.", result));
    });
    static getEvaluationStatus = asyncHandler(async (req, res) => {
        const attemptId = req.params.attemptId;
        const result = await AssessmentEvaluationService.getEvaluationStatus(req.user.id, req.user.role, attemptId);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Evaluation status retrieved successfully.", result));
    });
    static runCode = asyncHandler(async (req, res) => {
        const attemptId = req.params.attemptId;
        const questionId = req.params.questionId;
        const dto = req.body;
        const result = await AssessmentEvaluationService.runCode(req.user.id, attemptId, questionId, dto.code, dto.languageId);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Code executed successfully.", result));
    });
    static evaluateQuestionManually = asyncHandler(async (req, res) => {
        const attemptId = req.params.attemptId;
        const questionId = req.params.questionId;
        const dto = req.body;
        const result = await AssessmentEvaluationService.evaluateQuestionManually(req.user.id, attemptId, questionId, dto.score, dto.feedback || "");
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Question evaluation submitted successfully.", result));
    });
    static getFinalResult = asyncHandler(async (req, res) => {
        const attemptId = req.params.attemptId;
        const result = await AssessmentEvaluationService.getFinalResult(req.user.id, req.user.role, attemptId);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Assessment result retrieved successfully.", result));
    });
}
//# sourceMappingURL=assessmentEvaluation.controller.js.map