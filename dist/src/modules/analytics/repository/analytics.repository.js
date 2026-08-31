import prisma from "../../../config/database.js";
import { AttemptStatus } from "@prisma/client";
export class AnalyticsRepository {
    static async getCompanyJobs(companyId, startDate) {
        return prisma.job.findMany({
            where: {
                companyId,
            },
            select: {
                id: true,
                title: true,
                status: true,
                vacancies: true,
                createdAt: true,
                publishedAt: true,
                closedAt: true,
                applications: {
                    select: {
                        id: true,
                        status: true,
                        appliedAt: true,
                        hiredAt: true,
                        applicationWorkflow: {
                            select: {
                                workflowStage: {
                                    select: {
                                        stageLibrary: {
                                            select: {
                                                name: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    }
    static async getCompanyApplications(companyId, startDate) {
        return prisma.application.findMany({
            where: {
                job: {
                    companyId,
                },
                ...(startDate ? { appliedAt: { gte: startDate } } : {}),
            },
            select: {
                id: true,
                jobId: true,
                status: true,
                appliedAt: true,
                hiredAt: true,
                rejectedAt: true,
                withdrawnAt: true,
                candidate: {
                    select: {
                        id: true,
                        fullName: true,
                        linkedinUrl: true,
                        githubUrl: true,
                        portfolioUrl: true,
                        websiteUrl: true,
                    },
                },
                job: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                applicationWorkflow: {
                    select: {
                        workflowStage: {
                            select: {
                                id: true,
                                order: true,
                                stageLibrary: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
                assessmentAttempts: {
                    select: {
                        id: true,
                        status: true,
                        percentage: true,
                    },
                },
                interviewAssignments: {
                    select: {
                        id: true,
                        interview: {
                            select: {
                                id: true,
                                type: true,
                                title: true,
                            },
                        },
                    },
                },
            },
        });
    }
    static async getCompanyAssessments(companyId) {
        return prisma.assessment.findMany({
            where: {
                companyId,
                deletedAt: null,
            },
            select: {
                id: true,
                title: true,
                status: true,
                attempts: {
                    where: {
                        status: AttemptStatus.SUBMITTED,
                    },
                    select: {
                        id: true,
                        percentage: true,
                        overallScore: true,
                        passed: true,
                        submittedAt: true,
                        candidate: {
                            select: {
                                fullName: true,
                            },
                        },
                    },
                },
            },
        });
    }
    static async getCompanyInterviews(companyId) {
        return prisma.interview.findMany({
            where: {
                companyId,
            },
            select: {
                id: true,
                title: true,
                type: true,
                durationMinutes: true,
                sessions: {
                    select: {
                        id: true,
                        status: true,
                        scheduledAt: true,
                        startedAt: true,
                        endedAt: true,
                        participants: {
                            select: {
                                participantType: true,
                                assignment: {
                                    select: {
                                        application: {
                                            select: {
                                                candidate: {
                                                    select: {
                                                        fullName: true,
                                                    },
                                                },
                                                job: {
                                                    select: {
                                                        title: true,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        evaluations: {
                            select: {
                                id: true,
                                overallScore: true,
                                recommendation: true,
                            },
                        },
                        aiResult: {
                            select: {
                                overallScore: true,
                                recommendation: true,
                            },
                        },
                    },
                },
            },
        });
    }
}
//# sourceMappingURL=analytics.repository.js.map