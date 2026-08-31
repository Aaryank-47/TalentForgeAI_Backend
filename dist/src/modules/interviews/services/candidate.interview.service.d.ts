export declare class CandidateInterviewService {
    static getMyInterviews(userId: string, type?: string): Promise<{
        pending: any[];
        completed: any[];
    }>;
    static getSessionDetails(userId: string, sessionId: string): Promise<{
        sessionId: string;
        interviewId: string;
        role: any;
        interviewTitle: string;
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
        scheduledAt: Date;
        startedAt: Date | null;
        endedAt: Date | null;
        aiResult: {
            overallScore: number;
            recommendation: import("@prisma/client").$Enums.AIRecommendation | null;
        } | null;
        interviewers: {
            id: string;
            name: string;
            role: string;
            department: string;
            initials: string;
            avatarColor: string;
        }[];
    }>;
}
//# sourceMappingURL=candidate.interview.service.d.ts.map