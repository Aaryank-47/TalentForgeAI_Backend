import type { Prisma } from "@prisma/client";
export declare class AIInterviewFinalEvaluationService {
    static generateFinalEvaluation(sessionId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        overallScore: number;
        communicationScore: number | null;
        technicalScore: number | null;
        problemSolvingScore: number | null;
        recommendation: import("@prisma/client").$Enums.AIRecommendation | null;
        strengths: Prisma.JsonValue | null;
        sessionId: string;
        overallFeedback: string | null;
        weaknesses: Prisma.JsonValue | null;
    }>;
    static getFinalEvaluation(sessionId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        overallScore: number;
        communicationScore: number | null;
        technicalScore: number | null;
        problemSolvingScore: number | null;
        recommendation: import("@prisma/client").$Enums.AIRecommendation | null;
        strengths: Prisma.JsonValue | null;
        sessionId: string;
        overallFeedback: string | null;
        weaknesses: Prisma.JsonValue | null;
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
            expectedAreas: Prisma.JsonValue;
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
                    strengths: Prisma.JsonValue;
                    weaknesses: Prisma.JsonValue;
                } | null;
            } | null;
        }[];
        finalEvaluation: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            overallScore: number;
            communicationScore: number | null;
            technicalScore: number | null;
            problemSolvingScore: number | null;
            recommendation: import("@prisma/client").$Enums.AIRecommendation | null;
            strengths: Prisma.JsonValue | null;
            sessionId: string;
            overallFeedback: string | null;
            weaknesses: Prisma.JsonValue | null;
        } | null;
    }>;
    static getCompanyAIInterviews(companyId: string, search?: string): Promise<{
        id: string;
        sessionId: string;
        interviewId: string;
        candidate: string;
        email: string;
        role: string;
        date: string;
        aiScore: number;
        recommendation: string;
        tabSwitches: any;
        noiseFlags: any;
        faceVisibility: any;
        riskLevel: string;
        initials: string;
        color: string | undefined;
        feedbackSummary: string;
        strengths: string | number | true | Prisma.JsonObject | Prisma.JsonArray;
        weaknesses: string | number | true | Prisma.JsonObject | Prisma.JsonArray;
    }[]>;
}
//# sourceMappingURL=ai.final.evaluation.service.d.ts.map