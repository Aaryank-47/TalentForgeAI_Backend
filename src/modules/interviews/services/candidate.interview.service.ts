import prisma from "../../../config/database.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { BadRequestError } from "../../../common/errors/BadRequestError.js";
import { InterviewParticipantType } from "@prisma/client";

export class CandidateInterviewService {
    static async getMyInterviews(userId: string) {
        const candidate = await prisma.candidate.findUnique({
            where: { userId }
        });

        if (!candidate) {
            return {
                pending: [],
                completed: []
            };
        }

        // 1. Find all assignments for this candidate's applications (strictly AI interviews)
        const assignments = await prisma.interviewAssignment.findMany({
            where: {
                application: {
                    candidateId: candidate.id
                },
                interview: {
                    type: "AI"
                }
            },
            include: {
                interview: {
                    include: {
                        aiConfiguration: true,
                        company: {
                            select: {
                                id: true,
                                companyName: true,
                                logo: true
                            }
                        }
                    }
                },
                application: {
                    include: {
                        job: {
                            include: {
                                company: {
                                    select: {
                                        id: true,
                                        companyName: true,
                                        logo: true
                                    }
                                },
                                workflow: {
                                    include: {
                                        stages: {
                                            include: {
                                                stageLibrary: true
                                            },
                                            orderBy: {
                                                order: "asc"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        applicationWorkflow: {
                            include: {
                                workflowStage: {
                                    include: {
                                        stageLibrary: true
                                    }
                                }
                            }
                        }
                    }
                },
                sessionParticipants: {
                    include: {
                        session: {
                            include: {
                                aiResult: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        const pendingList: any[] = [];
        const completedList: any[] = [];

        for (const assignment of assignments) {
            // Workflow Stage Inspection: Verify candidate has reached the AI interview stage
            const jobInfo = assignment.application.job as any;
            const workflow = jobInfo?.workflow;
            if (workflow && workflow.stages && workflow.stages.length > 0) {
                const aiStage = workflow.stages.find((s: any) => {
                    const name = s.stageLibrary?.name?.toLowerCase() || "";
                    return s.interviewId === assignment.interviewId ||
                           name.includes("ai interview") ||
                           name.includes("ai technical") ||
                           name.includes("ai screening") ||
                           name.includes("interview");
                });

                if (aiStage) {
                    const currentStage = assignment.application.applicationWorkflow?.workflowStage;
                    if (!currentStage) {
                        const initialStage = workflow.stages[0];
                        if (initialStage && initialStage.id !== aiStage.id && initialStage.order < aiStage.order) {
                            // Candidate has not reached the AI interview stage yet
                            continue;
                        }
                    } else if (currentStage.order < aiStage.order && currentStage.id !== aiStage.id) {
                        // Candidate has not reached the AI interview stage yet
                        continue;
                    }
                }
            }

            let sessionParticipant = assignment.sessionParticipants[0];

            // If session doesn't exist for this assignment yet, auto-create a scheduled session
            if (!sessionParticipant) {
                const newSession = await prisma.interviewSession.create({
                    data: {
                        interviewId: assignment.interviewId,
                        scheduledAt: new Date(),
                        status: "SCHEDULED",
                        participants: {
                            create: {
                                participantType: InterviewParticipantType.CANDIDATE,
                                assignmentId: assignment.id
                            }
                        }
                    },
                    include: {
                        aiResult: true,
                        participants: true
                    }
                });
                sessionParticipant = {
                    ...newSession.participants[0]!,
                    session: newSession
                } as any;
            }

            const session = sessionParticipant!.session;
            let interview = assignment.interview;

            if (!interview.aiConfiguration) {
                const createdConfig = await prisma.aIInterviewConfiguration.create({
                    data: {
                        interviewId: interview.id,
                        questionCount: 5,
                        difficulty: "MEDIUM",
                        allowFollowUps: true
                    }
                });
                interview = {
                    ...interview,
                    aiConfiguration: createdConfig
                };
            }

            const company = jobInfo?.company || interview.company;
            const aiConfig = interview.aiConfiguration;
            const evalMetrics: any = aiConfig?.evaluationMetrics || {};

            const item = {
                id: assignment.id,
                assignmentId: assignment.id,
                sessionId: session.id,
                interviewId: interview.id,
                role: jobInfo?.title || interview.title,
                company: company?.companyName || "TalentForge Partner",
                companyLogo: (company?.companyName || "TF").slice(0, 2).toUpperCase(),
                companyColor: "bg-primary-600",
                department: jobInfo?.category || "Engineering",
                interviewType: interview.type === "AI" ? "Conversational AI" : "Live Technical",
                estimatedDuration: `${interview.durationMinutes || 25} mins`,
                durationMinutes: interview.durationMinutes || 25,
                questionCount: aiConfig?.questionCount || evalMetrics?.questionCount || 5,
                difficulty: aiConfig?.difficulty || "MEDIUM",
                deadline: evalMetrics?.deadline?.duration || "48 Hours",
                deadlineUrgency: "normal",
                assignedDate: new Date(assignment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                status: session.status,
                attemptsUsed: session.status === "COMPLETED" ? 1 : 0,
                attemptsAllowed: evalMetrics?.maxAttempts || 1,
                aiScore: session.aiResult?.overallScore ?? null,
                recommendation: session.aiResult?.recommendation ?? null,
                submittedDate: session.endedAt ? new Date(session.endedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null
            };

            if (session.status === "COMPLETED" || session.status === "EXPIRED") {
                completedList.push(item);
            } else {
                pendingList.push(item);
            }
        }

        return {
            pending: pendingList,
            completed: completedList
        };
    }

    static async getSessionDetails(userId: string, sessionId: string) {
        const candidate = await prisma.candidate.findUnique({
            where: { userId }
        });

        if (!candidate) {
            throw new NotFoundError("Candidate profile not found");
        }

        const session = await prisma.interviewSession.findUnique({
            where: { id: sessionId },
            include: {
                interview: {
                    include: {
                        aiConfiguration: true,
                        company: {
                            select: {
                                id: true,
                                companyName: true,
                                logo: true
                            }
                        }
                    }
                },
                participants: {
                    include: {
                        assignment: {
                            include: {
                                application: {
                                    include: {
                                        job: {
                                            include: {
                                                company: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                aiResult: true
            }
        });

        if (!session) {
            throw new NotFoundError("Interview session not found");
        }

        const candidateParticipant = session.participants.find(
            p => p.assignment?.application?.candidateId === candidate.id
        );

        if (!candidateParticipant) {
            throw new BadRequestError("You are not authorized to view this interview session");
        }

        const interview = session.interview;
        const job = candidateParticipant.assignment?.application?.job as any;
        const company = job?.company || interview.company;
        const aiConfig = interview.aiConfiguration;
        const evalMetrics: any = aiConfig?.evaluationMetrics || {};

        return {
            sessionId: session.id,
            interviewId: interview.id,
            role: job?.title || interview.title,
            company: company?.companyName || "TalentForge Partner",
            companyLogo: (company?.companyName || "TF").slice(0, 2).toUpperCase(),
            companyColor: "bg-primary-600",
            department: job?.category || "Engineering",
            interviewType: interview.type === "AI" ? "Conversational AI" : "Live Technical",
            language: "English",
            estimatedDuration: `${interview.durationMinutes || 25} mins`,
            durationMinutes: interview.durationMinutes || 25,
            questionCount: aiConfig?.questionCount || evalMetrics?.questionCount || 5,
            difficulty: aiConfig?.difficulty || "MEDIUM",
            instructions: interview.instructions || "Answer each question clearly. You will be evaluated on technical depth and communication.",
            status: session.status,
            startedAt: session.startedAt,
            endedAt: session.endedAt,
            aiResult: session.aiResult ? {
                overallScore: session.aiResult.overallScore,
                recommendation: session.aiResult.recommendation
            } : null
        };
    }
}
