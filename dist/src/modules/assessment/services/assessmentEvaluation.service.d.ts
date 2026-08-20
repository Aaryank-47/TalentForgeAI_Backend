import { UserRole } from "@prisma/client";
import type { StartEvaluationResponse, EvaluationStatusResponse, CodeExecutionResponse, QuestionEvaluationResponse, AssessmentEvaluationResultResponse, MCQEvaluationResult, DSAEvaluationResult, AssessmentEvaluationResult } from "../interfaces/assessmentEvaluation.interface.js";
export declare class AssessmentEvaluationService {
    static startEvaluation(userId: string, attemptId: string): Promise<StartEvaluationResponse>;
    static runOrchestrator(attemptId: string): Promise<void>;
    static getEvaluationStatus(userId: string, role: UserRole, attemptId: string): Promise<EvaluationStatusResponse>;
    static runCode(userId: string, attemptId: string, questionId: string, code: string, languageId: string): Promise<CodeExecutionResponse>;
    static evaluateQuestionManually(userId: string, attemptId: string, questionId: string, score: number, feedback: string): Promise<QuestionEvaluationResponse>;
    static getFinalResult(userId: string, role: UserRole, attemptId: string): Promise<AssessmentEvaluationResultResponse>;
}
export declare class MCQEvaluationService {
    static evaluateAttempt(attemptId: string): Promise<MCQEvaluationResult>;
}
export declare class DSAEvaluationService {
    static evaluateAttempt(attemptId: string): Promise<DSAEvaluationResult>;
}
export declare class AssessmentResultService {
    static calculateFinalResult(attemptId: string): Promise<AssessmentEvaluationResult>;
}
//# sourceMappingURL=assessmentEvaluation.service.d.ts.map