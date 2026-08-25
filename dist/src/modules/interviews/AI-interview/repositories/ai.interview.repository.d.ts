import type { CreateAIQuestionInput, SaveAIAnswerInput, CreateAIEvaluationInput, CreateAIInterviewResultInput } from "../interfaces/ai.interview.interface.js";
export declare class AIInterviewQuestionsRepository {
    static createQuestion(data: CreateAIQuestionInput): Promise<{
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
    static saveAnswer(data: SaveAIAnswerInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        questionId: string;
        answerText: string;
        recordingUrl: string | null;
        answeredAt: Date;
    }>;
    static getQuestionsBySessionId(sessionId: string): Promise<({
        answer: ({
            evaluation: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                score: number;
                feedback: string | null;
                answerId: string;
                technicalAccuracy: number | null;
                relevance: number | null;
                completeness: number | null;
                communication: number | null;
                strengths: import("@prisma/client/runtime/client").JsonValue | null;
                weaknesses: import("@prisma/client/runtime/client").JsonValue | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            questionId: string;
            answerText: string;
            recordingUrl: string | null;
            answeredAt: Date;
        }) | null;
    } & {
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
    })[]>;
    static getSessionHistory(sessionId: string): Promise<({
        answer: ({
            evaluation: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                score: number;
                feedback: string | null;
                answerId: string;
                technicalAccuracy: number | null;
                relevance: number | null;
                completeness: number | null;
                communication: number | null;
                strengths: import("@prisma/client/runtime/client").JsonValue | null;
                weaknesses: import("@prisma/client/runtime/client").JsonValue | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            questionId: string;
            answerText: string;
            recordingUrl: string | null;
            answeredAt: Date;
        }) | null;
    } & {
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
    })[]>;
    static findCurrentUnansweredQuestion(sessionId: string): Promise<{
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
    } | null>;
    static findExpiredSessions(): Promise<({
        interview: {
            durationMinutes: number | null;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.InterviewSessionStatus;
        createdAt: Date;
        updatedAt: Date;
        interviewId: string;
        startedAt: Date | null;
        scheduledAt: Date;
        endedAt: Date | null;
        roomId: string | null;
    })[]>;
    static markSessionExpired(sessionId: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.InterviewSessionStatus;
        createdAt: Date;
        updatedAt: Date;
        interviewId: string;
        startedAt: Date | null;
        scheduledAt: Date;
        endedAt: Date | null;
        roomId: string | null;
    }>;
}
export declare class AIInterviewEvaluationRepository {
    static create(data: CreateAIEvaluationInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        score: number;
        feedback: string | null;
        answerId: string;
        technicalAccuracy: number | null;
        relevance: number | null;
        completeness: number | null;
        communication: number | null;
        strengths: import("@prisma/client/runtime/client").JsonValue | null;
        weaknesses: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    static findFinalEvaluationBySessionId(sessionId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        overallScore: number;
        sessionId: string;
        strengths: import("@prisma/client/runtime/client").JsonValue | null;
        weaknesses: import("@prisma/client/runtime/client").JsonValue | null;
        technicalScore: number | null;
        communicationScore: number | null;
        problemSolvingScore: number | null;
        overallFeedback: string | null;
        recommendation: import("@prisma/client").$Enums.AIRecommendation | null;
    } | null>;
    static upsertResult(data: CreateAIInterviewResultInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        overallScore: number;
        sessionId: string;
        strengths: import("@prisma/client/runtime/client").JsonValue | null;
        weaknesses: import("@prisma/client/runtime/client").JsonValue | null;
        technicalScore: number | null;
        communicationScore: number | null;
        problemSolvingScore: number | null;
        overallFeedback: string | null;
        recommendation: import("@prisma/client").$Enums.AIRecommendation | null;
    }>;
}
//# sourceMappingURL=ai.interview.repository.d.ts.map