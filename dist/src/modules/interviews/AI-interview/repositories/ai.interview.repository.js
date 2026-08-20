import prisma from "../../../../config/database.js";
export class AIInterviewQuestionsRepository {
    static async createQuestion(data) {
        let targetSequence = data.sequence;
        const existingWithSequence = await prisma.aIInterviewQuestion.findUnique({
            where: {
                sessionId_sequence: {
                    sessionId: data.sessionId,
                    sequence: targetSequence
                }
            }
        });
        if (existingWithSequence) {
            const maxQuestion = await prisma.aIInterviewQuestion.findFirst({
                where: { sessionId: data.sessionId },
                orderBy: { sequence: "desc" },
                select: { sequence: true }
            });
            targetSequence = (maxQuestion?.sequence ?? 0) + 1;
        }
        return prisma.aIInterviewQuestion.create({
            data: {
                sessionId: data.sessionId,
                sequence: targetSequence,
                question: data.question,
                topic: data.topic ?? null,
                skill: data.skill ?? null,
                difficulty: data.difficulty ?? null,
                expectedAreas: data.expectedAreas,
                parentAIQuestionId: data.parentAIQuestionId ?? null
            }
        });
    }
    static async saveAnswer(data) {
        const { questionId, answerText, recordingUrl } = data;
        return prisma.aIInterviewAnswer.create({
            data: {
                questionId,
                answerText,
                recordingUrl: recordingUrl ?? null
            }
        });
    }
    static async getQuestionsBySessionId(sessionId) {
        return prisma.aIInterviewQuestion.findMany({
            where: {
                sessionId
            },
            include: {
                answer: {
                    include: {
                        evaluation: true
                    }
                }
            },
            orderBy: {
                sequence: "asc"
            }
        });
    }
    static async getSessionHistory(sessionId) {
        return prisma.aIInterviewQuestion.findMany({
            where: { sessionId },
            include: {
                answer: {
                    include: {
                        evaluation: true
                    }
                }
            },
            orderBy: {
                sequence: "asc"
            }
        });
    }
    static async findCurrentUnansweredQuestion(sessionId) {
        return prisma.aIInterviewQuestion.findFirst({
            where: {
                sessionId,
                answer: null
            },
            orderBy: {
                sequence: "asc"
            }
        });
    }
    static async findExpiredSessions() {
        const activeSessions = await prisma.interviewSession.findMany({
            where: {
                status: "IN_PROGRESS",
                startedAt: { not: null }
            },
            include: {
                interview: {
                    select: {
                        durationMinutes: true
                    }
                }
            }
        });
        const now = new Date();
        return activeSessions.filter(session => {
            const durationMinutes = session.interview.durationMinutes ?? 30;
            const expiresAt = new Date(session.startedAt.getTime() + durationMinutes * 60 * 1000);
            return now >= expiresAt;
        });
    }
    static async markSessionExpired(sessionId) {
        return prisma.interviewSession.update({
            where: { id: sessionId },
            data: {
                status: "EXPIRED",
                endedAt: new Date()
            }
        });
    }
}
export class AIInterviewEvaluationRepository {
    static async create(data) {
        return prisma.aIInterviewEvaluation.create({
            data: {
                answerId: data.answerId,
                score: data.score,
                feedback: data.evaluation,
                strengths: data.strengths,
                weaknesses: data.weaknesses
            }
        });
    }
    static async findFinalEvaluationBySessionId(sessionId) {
        return prisma.aIInterviewResult.findUnique({
            where: { sessionId }
        });
    }
    static async upsertResult(data) {
        return prisma.aIInterviewResult.upsert({
            where: { sessionId: data.sessionId },
            create: {
                sessionId: data.sessionId,
                overallScore: data.overallScore,
                technicalScore: data.technicalScore ?? null,
                communicationScore: data.communicationScore ?? null,
                problemSolvingScore: data.problemSolvingScore ?? null,
                overallFeedback: data.overallFeedback ?? null,
                strengths: data.strengths ?? [],
                weaknesses: data.weaknesses ?? [],
                recommendation: data.recommendation ?? null
            },
            update: {
                overallScore: data.overallScore,
                technicalScore: data.technicalScore ?? null,
                communicationScore: data.communicationScore ?? null,
                problemSolvingScore: data.problemSolvingScore ?? null,
                overallFeedback: data.overallFeedback ?? null,
                strengths: data.strengths ?? [],
                weaknesses: data.weaknesses ?? [],
                recommendation: data.recommendation ?? null
            }
        });
    }
}
//# sourceMappingURL=ai.interview.repository.js.map