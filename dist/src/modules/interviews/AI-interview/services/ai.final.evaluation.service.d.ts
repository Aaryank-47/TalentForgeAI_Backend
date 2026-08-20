export declare class AIInterviewFinalEvaluationService {
    static generateFinalEvaluation(sessionId: string): Promise<{
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
    static getFinalEvaluation(sessionId: string): Promise<{
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
    static getFinalReport(sessionId: string): Promise<{
        session: {
            id: string;
            status: import("@prisma/client").$Enums.InterviewSessionStatus;
            startedAt: Date | null;
            endedAt: Date | null;
            interview: {
                id: string;
                title: string;
                description: string | null;
                type: import("@prisma/client").$Enums.InterviewType;
            };
            job: {
                id: string;
                title: string;
                companyId: string;
            } | null;
        };
        questions: {
            id: string;
            sequence: number;
            question: string;
            topic: string | null;
            skill: string | null;
            difficulty: import("@prisma/client").$Enums.QuestionDifficulty | null;
            expectedAreas: import("@prisma/client/runtime/client").JsonValue;
            parentAIQuestionId: string | null;
            answer: {
                id: string;
                answerText: string;
                recordingUrl: string | null;
                answeredAt: Date;
                evaluation: {
                    id: string;
                    score: number;
                    feedback: string | null;
                    strengths: import("@prisma/client/runtime/client").JsonValue;
                    weaknesses: import("@prisma/client/runtime/client").JsonValue;
                } | null;
            } | null;
        }[];
        finalEvaluation: {
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
        } | null;
    }>;
}
//# sourceMappingURL=ai.final.evaluation.service.d.ts.map