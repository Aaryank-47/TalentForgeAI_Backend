export declare class CandidateInterviewService {
    static getMyInterviews(userId: string): Promise<{
        pending: any[];
        completed: any[];
    }>;
    static getSessionDetails(userId: string, sessionId: string): Promise<{
        sessionId: string;
        interviewId: string;
        role: any;
        company: any;
        companyLogo: any;
        companyColor: string;
        department: any;
        interviewType: string;
        language: string;
        estimatedDuration: string;
        durationMinutes: number;
        questionCount: any;
        difficulty: import("@prisma/client").$Enums.QuestionDifficulty;
        instructions: string;
        status: import("@prisma/client").$Enums.InterviewSessionStatus;
        startedAt: Date | null;
        endedAt: Date | null;
        aiResult: {
            overallScore: number;
            recommendation: import("@prisma/client").$Enums.AIRecommendation | null;
        } | null;
    }>;
}
//# sourceMappingURL=candidate.interview.service.d.ts.map