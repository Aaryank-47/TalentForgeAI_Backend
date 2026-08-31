export declare class AnalyticsRepository {
    static getCompanyJobs(companyId: string, startDate?: Date): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.JobStatus;
        createdAt: Date;
        applications: {
            id: string;
            status: import("@prisma/client").$Enums.ApplicationStatus;
            applicationWorkflow: {
                workflowStage: {
                    stageLibrary: {
                        name: string;
                    };
                };
            } | null;
            appliedAt: Date;
            hiredAt: Date | null;
        }[];
        title: string;
        publishedAt: Date | null;
        vacancies: number;
        closedAt: Date | null;
    }[]>;
    static getCompanyApplications(companyId: string, startDate?: Date): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        candidate: {
            fullName: string;
            linkedinUrl: string | null;
            githubUrl: string | null;
            portfolioUrl: string | null;
            websiteUrl: string | null;
            id: string;
        };
        assessmentAttempts: {
            id: string;
            status: import("@prisma/client").$Enums.AttemptStatus;
            percentage: number | null;
        }[];
        interviewAssignments: {
            id: string;
            interview: {
                type: import("@prisma/client").$Enums.InterviewType;
                id: string;
                title: string;
            };
        }[];
        job: {
            id: string;
            title: string;
        };
        applicationWorkflow: {
            workflowStage: {
                id: string;
                stageLibrary: {
                    name: string;
                };
                order: number;
            };
        } | null;
        jobId: string;
        appliedAt: Date;
        withdrawnAt: Date | null;
        rejectedAt: Date | null;
        hiredAt: Date | null;
    }[]>;
    static getCompanyAssessments(companyId: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.AssessmentStatus;
        title: string;
        attempts: {
            id: string;
            candidate: {
                fullName: string;
            };
            submittedAt: Date | null;
            overallScore: number | null;
            percentage: number | null;
            passed: boolean | null;
        }[];
    }[]>;
    static getCompanyInterviews(companyId: string): Promise<{
        type: import("@prisma/client").$Enums.InterviewType;
        id: string;
        title: string;
        durationMinutes: number | null;
        sessions: {
            id: string;
            status: import("@prisma/client").$Enums.InterviewSessionStatus;
            startedAt: Date | null;
            scheduledAt: Date;
            endedAt: Date | null;
            participants: {
                participantType: import("@prisma/client").$Enums.InterviewParticipantType;
                assignment: {
                    application: {
                        candidate: {
                            fullName: string;
                        };
                        job: {
                            title: string;
                        };
                    };
                } | null;
            }[];
            aiResult: {
                overallScore: number;
                recommendation: import("@prisma/client").$Enums.AIRecommendation | null;
            } | null;
            evaluations: {
                id: string;
                overallScore: number;
                recommendation: import("@prisma/client").$Enums.AIRecommendation | null;
            }[];
        }[];
    }[]>;
}
//# sourceMappingURL=analytics.repository.d.ts.map