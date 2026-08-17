import prisma from "../../../../config/database.js";
export class AIInterviewQuestionsRepository {
    static async createInterviewQuestions({
        sessionId,
        questions
    }: {
        sessionId: string;
        questions: any[];
    }) {
        const createdQuestions = await prisma.$transaction(
            questions.map((q: any) =>
                prisma.aIInterviewQuestion.create({
                    data: {
                        sessionId,
                        sequence: q.sequence,
                        question: q.question,
                        topic: q.topic || null,
                        skill: q.skill || null,
                        difficulty: q.difficulty || null,
                        expectedAreas: q.expectedAreas || [],
                        parentAIQuestionId: null
                    }
                })
            )
        );

        return createdQuestions;
    }

    static async saveAnswerAndCreateFollowUp({
        sessionId,
        parentQuestionId,
        answerText,
        followUp
    }: {
        sessionId: string;
        parentQuestionId: string;
        answerText: string;
        followUp: {
            sequence: number;
            question: string;
            topic?: string | null;
            skill?: string | null;
            difficulty?: any | null;
            expectedAreas?: string[] | null;
        };
    }) {
        return prisma.$transaction(async (tx) => {
            const answer = await tx.aIInterviewAnswer.create({
                data: {
                    questionId: parentQuestionId,
                    answerText
                }
            });

            const followUpQuestion = await tx.aIInterviewQuestion.create({
                data: {
                    sessionId,
                    sequence: followUp.sequence,
                    question: followUp.question,
                    topic: followUp.topic || null,
                    skill: followUp.skill || null,
                    difficulty: followUp.difficulty || null,
                    expectedAreas: followUp.expectedAreas || [],
                    parentAIQuestionId: parentQuestionId
                }
            });

            return { answer, followUpQuestion };
        });
    }
}