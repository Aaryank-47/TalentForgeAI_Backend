import prisma from "../../../config/database.js";
import { AttemptStatus, EvaluationStatus } from "@prisma/client";

export class AssessmentEvaluationRepository {
    static async findAttemptById(id: string) {
        return await prisma.assessmentAttempt.findUnique({
            where: { id },
            include: {
                candidate: {
                    select: {
                        userId: true
                    }
                },
                assessment: {
                    select: {
                        id: true,
                        title: true,
                        companyId: true,
                        durationMinutes: true,
                        passingScore: true,
                        totalMarks: true
                    }
                }
            }
        });
    }

    static async findAttemptWithAnswersAndQuestions(id: string) {
        return await prisma.assessmentAttempt.findUnique({
            where: { id },
            include: {
                assessment: {
                    include: {
                        sections: {
                            include: {
                                items: {
                                    include: {
                                        question: {
                                            include: {
                                                mcqDetail: {
                                                    include: {
                                                        options: true
                                                    }
                                                },
                                                dsaDetail: {
                                                    include: {
                                                        testCases: true,
                                                        supportedLanguages: true
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                answers: true
            }
        });
    }

    static async updateEvaluationStatus(id: string, status: EvaluationStatus) {
        return await prisma.assessmentAttempt.update({
            where: { id },
            data: { evaluationStatus: status }
        });
    }

    static async updateAssessmentAttemptResult(
        id: string,
        overallScore: number,
        percentage: number,
        passed: boolean,
        evaluationStatus: EvaluationStatus
    ) {
        return await prisma.assessmentAttempt.update({
            where: { id },
            data: {
                overallScore,
                percentage,
                passed,
                evaluationStatus
            }
        });
    }

    static async findQuestionInSectionItem(assessmentId: string, questionId: string) {
        return await prisma.assessmentSectionItem.findFirst({
            where: {
                questionId,
                section: {
                    assessmentId
                }
            },
            include: {
                question: {
                    include: {
                        dsaDetail: {
                            include: {
                                supportedLanguages: true
                            }
                        }
                    }
                }
            }
        });
    }

    static async findAnswerByAttemptAndQuestion(attemptId: string, questionId: string) {
        return await prisma.assessmentAnswer.findUnique({
            where: {
                attemptId_questionId: {
                    attemptId,
                    questionId
                }
            }
        });
    }

    static async updateQuestionEvaluation(
        attemptId: string,
        questionId: string,
        score: number,
        feedback: string | null,
        isCorrect: boolean | null
    ) {
        return await prisma.assessmentAnswer.upsert({
            where: {
                attemptId_questionId: {
                    attemptId,
                    questionId
                }
            },
            create: {
                attemptId,
                questionId,
                score,
                feedback,
                isCorrect,
                startedAt: new Date()
            },
            update: {
                score,
                feedback,
                isCorrect
            }
        });
    }

    static async checkActiveCompanyMember(userId: string, companyId: string) {
        return await prisma.companyMember.findFirst({
            where: {
                userId,
                companyId,
                status: "ACTIVE"
            }
        });
    }
}
