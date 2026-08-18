import type { QuestionDifficulty, AIRecommendation } from "@prisma/client";

export interface AIInterviewQuestionData {
    sequence: number;
    question: string;
    topic?: string;
    skill?: string;
    difficulty?: QuestionDifficulty;
    expectedAreas?: string[];
}

export interface AIGeneratedQuestions {
    questions: AIInterviewQuestionData[];
}

export interface AIInterviewGenerationContext {
    interview: {
        title: string;
        description?: string | null;
        instructions?: string | null;
    };

    job: {
        title: string;
        description?: string | null;
        requirements?: string | null;
        skills?: string[];
    };

    configuration: {
        questionCount: number;
        difficulty: QuestionDifficulty;
        allowFollowUps: boolean;
        systemPrompt?: string | null;
        evaluationMetrics?: unknown;
    };
}

export interface AIGeneratedPrompt {
    systemPrompt: string;
    userPrompt: string;
}

export interface AIEvaluationPromptContext {
    question: string;
    expectedAreas: string[];
    candidateAnswer: string;
    evaluationMetrics?: unknown;
}


export interface AIEvaluationResult {
    score: number;
    evaluation: string;
    strengths: string[];
    weaknesses: string[];
}

export interface AIEvaluateAnswerInput {
    answerId: string;
}

export interface AIQuestionProgressionContext {
    currentQuestion: string;
    candidateAnswer: string;
    evaluation: {
        score: number;
        evaluation: string;
        strengths: string[];
        weaknesses: string[];
    };
    allowFollowUps: boolean;
    topic?: string | null;
    skill?: string | null;
    difficulty?: string | null;
    expectedAreas: string[];
}

export interface AIQuestionProgressionResult {
    shouldFollowUp: boolean;
    reason: string;
    followUpQuestion?: {
        question: string;
        topic?: string | null;
        skill?: string | null;
        difficulty?: string | null;
        expectedAreas?: string[];
    } | null;
}

export interface CreateAIQuestionInput {
    sessionId: string;
    sequence: number;
    question: string;
    topic?: string | null;
    skill?: string | null;
    difficulty?: QuestionDifficulty | null;
    expectedAreas: string[];
    parentAIQuestionId?: string | null;
}

export interface SaveAIAnswerInput {
    questionId: string;
    answerText: string;
    recordingUrl?: string | null;
}

export interface CreateAIEvaluationInput extends AIEvaluationResult {
    answerId: string;
}

export interface CreateAIInterviewResultInput {
    sessionId: string;
    overallScore: number;
    technicalScore?: number | null;
    communicationScore?: number | null;
    problemSolvingScore?: number | null;
    overallFeedback?: string | null;
    strengths?: string[];
    weaknesses?: string[];
    recommendation?: AIRecommendation | null;
}

export interface AIInterviewFinalEvaluationContext {
    interview: {
        title: string;
        description?: string | null;
        instructions?: string | null;
    };
    job: {
        title: string;
        description?: string | null;
        requirements?: string | null;
        skills?: string[];
    };
    configuration: {
        questionCount: number;
        difficulty: QuestionDifficulty;
        evaluationMetrics?: unknown;
        systemPrompt?: string | null;
    };
    questions: {
        sequence: number;
        question: string;
        topic?: string | null;
        skill?: string | null;
        difficulty?: string | null;
        expectedAreas: string[];
        candidateAnswer: string;
        evaluation: {
            score: number;
            evaluation: string;
            strengths: string[];
            weaknesses: string[];
        };
    }[];
}