import { asyncHandler } from "../../../../common/helper/asyncHandler.js";
import { AIQuestionService } from "../services/ai.interview.service.js";
import { AIInterviewFinalEvaluationService } from "../services/ai.final.evaluation.service.js";
import { HTTP_STATUS } from "../../../../common/constants/httpStatus.js";
export class AIInterviewController {
    static generateQuestions = asyncHandler(async (req, res) => {
        const { sessionId } = req.params;
        const question = await AIQuestionService.generateFirstQuestion(sessionId);
        return res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: "AI interview first question generated successfully",
            data: question
        });
    });
    static getFinalResult = asyncHandler(async (req, res) => {
        const { sessionId } = req.params;
        const report = await AIInterviewFinalEvaluationService.getFinalReport(sessionId);
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "AI interview final report retrieved successfully",
            data: report
        });
    });
    static getCompanyAIInterviews = asyncHandler(async (req, res) => {
        const { companyId } = req.params;
        const { search } = req.query;
        const results = await AIInterviewFinalEvaluationService.getCompanyAIInterviews(companyId, search);
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Company AI interviews retrieved successfully",
            data: results
        });
    });
}
//# sourceMappingURL=ai.interview.controller.js.map