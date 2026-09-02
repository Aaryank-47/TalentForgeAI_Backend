import { EventEmitter } from "node:events";
import type { AIInterviewGenerationContext, AIGeneratedPrompt, AIQuestionProgressionContext, AIInterviewFinalEvaluationContext } from "../interfaces/ai.interview.interface.js";
export declare class AIinterviewPromptService {
    static buildInitialQuestionPrompt(context: AIInterviewGenerationContext): AIGeneratedPrompt;
    static buildNextQuestionPrompt(context: AIInterviewGenerationContext, history: {
        question: string;
        answer: string;
    }[]): AIGeneratedPrompt;
    static buildAnswerEvaluationAndProgressionPrompt(context: AIQuestionProgressionContext, history: {
        question: string;
        answer: string;
        score: number;
    }[], allowFollowUps: boolean): AIGeneratedPrompt;
    static buildFinalInterviewEvaluationPrompt(context: AIInterviewFinalEvaluationContext): AIGeneratedPrompt;
}
export declare class AIQuestionService {
    static generateFirstQuestion(sessionId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        skill: string | null;
        question: string;
        difficulty: import("@prisma/client").$Enums.QuestionDifficulty | null;
        sessionId: string;
        sequence: number;
        topic: string | null;
        expectedAreas: import("@prisma/client/runtime/client").JsonValue | null;
        parentAIQuestionId: string | null;
    }>;
    static generateNextQuestion(sessionId: string, currentSequence: number, history: {
        question: string;
        answer: string;
    }[]): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        skill: string | null;
        question: string;
        difficulty: import("@prisma/client").$Enums.QuestionDifficulty | null;
        sessionId: string;
        sequence: number;
        topic: string | null;
        expectedAreas: import("@prisma/client/runtime/client").JsonValue | null;
        parentAIQuestionId: string | null;
    }>;
}
export declare class AIInterviewSessionService {
    static validateAndGetCurrentQuestion(sessionId: string, userId: string): Promise<{
        sessionId: string;
        status: "IN_PROGRESS" | "COMPLETED" | "EXPIRED" | "CANCELLED" | "SCHEDULED";
        question?: {
            sessionId: string;
            questionId: string;
            sequence: number;
            question: string;
            topic?: string | null;
            skill?: string | null;
            difficulty?: unknown;
        } | null;
        message?: string;
        reason?: string;
    }>;
    static endSession(data: {
        userId: string;
        sessionId: string;
    }): Promise<{
        sessionId: string;
        status: string;
        message: string;
        result?: never;
    } | {
        sessionId: string;
        status: string;
        message: string;
        result: any;
    }>;
    static submitAnswer(data: {
        userId: string;
        sessionId: string;
        questionId: string;
        answerText: string;
        recordingUrl: string | null;
    }): Promise<{
        submittedQuestionId: string;
        answerSubmitted: boolean;
        answerId: string;
        submittedAt: Date;
        evaluation: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            score: number;
            feedback: string | null;
            answerId: string;
            strengths: import("@prisma/client/runtime/client").JsonValue | null;
            weaknesses: import("@prisma/client/runtime/client").JsonValue | null;
            technicalAccuracy: number | null;
            relevance: number | null;
            completeness: number | null;
            communication: number | null;
        };
        nextQuestion: {
            sessionId: string;
            questionId: string;
            sequence: number;
            question: string;
            topic: string | null;
            skill: string | null;
            difficulty: import("@prisma/client").$Enums.QuestionDifficulty | null;
        } | null;
        completed: boolean;
        sendOffMessage: any;
        result: any;
    }>;
}
export declare class AIQuestionProgressionService {
    static evaluateAndProgress(answerId: string, question: {
        id: string;
        question: string;
        topic?: string | null;
        skill?: string | null;
        difficulty?: unknown;
        expectedAreas: unknown;
        parentAIQuestionId?: string | null;
    }, answerText: string, session: {
        id: string;
        interview: {
            aiConfiguration: {
                questionCount: number;
                difficulty: unknown;
                allowFollowUps: boolean;
                systemPrompt?: string | null;
                evaluationMetrics?: unknown;
            } | null;
        };
    }): Promise<{
        evaluation: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            score: number;
            feedback: string | null;
            answerId: string;
            strengths: import("@prisma/client/runtime/client").JsonValue | null;
            weaknesses: import("@prisma/client/runtime/client").JsonValue | null;
            technicalAccuracy: number | null;
            relevance: number | null;
            completeness: number | null;
            communication: number | null;
        };
        nextQuestion: null;
        completed: boolean;
        sendOffMessage: string;
        result: any;
    } | {
        evaluation: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            score: number;
            feedback: string | null;
            answerId: string;
            strengths: import("@prisma/client/runtime/client").JsonValue | null;
            weaknesses: import("@prisma/client/runtime/client").JsonValue | null;
            technicalAccuracy: number | null;
            relevance: number | null;
            completeness: number | null;
            communication: number | null;
        };
        nextQuestion: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            skill: string | null;
            question: string;
            difficulty: import("@prisma/client").$Enums.QuestionDifficulty | null;
            sessionId: string;
            sequence: number;
            topic: string | null;
            expectedAreas: import("@prisma/client/runtime/client").JsonValue | null;
            parentAIQuestionId: string | null;
        };
        completed: boolean;
        sendOffMessage?: never;
        result?: never;
    }>;
}
export declare const interviewEvents: EventEmitter<any>;
export declare class AIInterviewCompletionService {
    static finalizeSession(sessionId: string): Promise<{
        updatedSession: {
            id: string;
            status: import("@prisma/client").$Enums.InterviewSessionStatus;
            createdAt: Date;
            updatedAt: Date;
            scheduledAt: Date;
            interviewId: string;
            startedAt: Date | null;
            endedAt: Date | null;
            roomId: string | null;
        };
        aiResult: any;
    }>;
}
//# sourceMappingURL=ai.interview.service.d.ts.map