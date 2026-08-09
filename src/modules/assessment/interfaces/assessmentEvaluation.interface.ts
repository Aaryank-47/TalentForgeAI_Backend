export interface StartEvaluationResponse {
    attemptId: string;
    evaluationStatus: string;
}

export interface EvaluationStatusResponse {
    attemptId: string;
    evaluationStatus: string;
}

export interface CodeExecutionResponse {
    status: string;
    passedTestCases: number;
    totalTestCases: number;
    executionTimeMs: number;
    memoryUsedKb: number;
}

export interface QuestionEvaluationResponse {
    attemptId: string;
    questionId: string;
    score: number;
    feedback: string;
}

export interface AssessmentEvaluationResultResponse {
    attemptId: string;
    overallScore: number;
    percentage: number;
    passed: boolean;
    evaluationStatus: string;
}

export interface MCQEvaluationResult {
    totalQuestions: number;
    answeredQuestions: number;
    correctAnswers: number;
    score: number;
    totalMarks: number;
}

export interface DSAEvaluationResult {
    totalQuestions: number;
    passedQuestions: number;
    score: number;
    totalMarks: number;
}

export interface AssessmentEvaluationResult {
    overallScore: number;
    percentage: number;
    passed: boolean;
}
