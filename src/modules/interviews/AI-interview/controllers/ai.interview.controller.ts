import type { Request, Response } from "express";
import { asyncHandler } from "../../../../common/helper/asyncHandler.js";
import { AIQuestionService } from "../services/ai.interview.service.js";
import { HTTP_STATUS } from "../../../../common/constants/httpStatus.js";

export class AIInterviewController {
    static generateQuestions = asyncHandler(
        async (req: Request, res: Response) => {
            const { sessionId } = req.params;

            const questions = await AIQuestionService.generateQuestionsForSession(sessionId as string);

            return res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: "AI interview questions generated and persisted successfully",
                data: questions
            });
        }
    );

    static generateFollowUp = asyncHandler(
        async (req: Request, res: Response) => {
            const { sessionId, questionId } = req.params;
            const { answerText } = req.body;

            const result = await AIQuestionService.generateFollowUpQuestionForSession(
                sessionId as string,
                questionId as string,
                answerText
            );

            return res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: "AI follow-up question generated and answer persisted successfully",
                data: result
            });
        }
    );
}
