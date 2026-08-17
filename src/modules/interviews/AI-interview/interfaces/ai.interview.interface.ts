import type { QuestionDifficulty } from "@prisma/client";

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