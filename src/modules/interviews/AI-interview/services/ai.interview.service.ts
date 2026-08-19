import { EventEmitter } from "node:events";
import type { QuestionDifficulty, AIRecommendation } from "@prisma/client";
import type { 
    AIInterviewGenerationContext, 
    AIGeneratedPrompt, 
    AIQuestionProgressionContext,
    AIInterviewFinalEvaluationContext
} from "../interfaces/ai.interview.interface.js";
import { OpenRouterClient } from "../../../../common/integrations/openRouter/openrouter.client.js";
import prisma from "../../../../config/database.js";
import { InterviewSessionsRepositories, InterviewSessionParticipantsRepositories } from "../../repositories/interviews.repository.js";
import { AIInterviewQuestionsRepository, AIInterviewEvaluationRepository } from "../repositories/ai.interview.repository.js";
import { AIInterviewFinalEvaluationService } from "./ai.final.evaluation.service.js";
import { AIInterviewTimeoutWorker } from "./ai.timeout.service.js";
import { NotFoundError } from "../../../../common/errors/NotFoundError.js";
import { BadRequestError } from "../../../../common/errors/BadRequestError.js";
import { AIProcessingError } from "../../../../common/errors/AIProcessingError.js";
import { 
    AIGeneratedQuestionSchema,
    AICombinedEvaluationAndProgressionValidator
} from "../dto/ai.interview.dto.js";
import { cleanJsonResponse } from "../utils/ai.interview.utils.js";

export class AIinterviewPromptService {
    static buildInitialQuestionPrompt(
        context: AIInterviewGenerationContext
    ): AIGeneratedPrompt {
        const systemPrompt = `
You are an expert AI interviewer.
Your task is to generate the first structured interview question based on the provided interview context, job description, requirements, skills, and configuration.
Return ONLY valid JSON matching this schema:
{
    "question": "string",
    "topic": "string",
    "skill": "string",
    "difficulty": "string",
    "expectedAreas": ["string"]
}
Do not include markdown fences, code blocks, HTML, or explanations outside the JSON.
`;

        const userPrompt = `
=== INTERVIEW ===
Title: ${context.interview.title}
Description: ${context.interview.description || "N/A"}
Instructions: ${context.interview.instructions || "N/A"}

=== JOB ===
Title: ${context.job.title}
Description: ${context.job.description || "N/A"}
Skills: ${context.job.skills?.join(", ") || "N/A"}

=== CONFIGURATION ===
Difficulty: ${context.configuration.difficulty}
`;

        return { systemPrompt, userPrompt };
    }

    static buildNextQuestionPrompt(
        context: AIInterviewGenerationContext,
        history: { question: string; answer: string }[]
    ): AIGeneratedPrompt {
        const systemPrompt = `
You are an expert AI interviewer.
Your task is to generate the next main structured interview question. 
It must be a new question that naturally continues the interview without repeating previously asked questions.
Return ONLY valid JSON matching this schema:
{
    "question": "string",
    "topic": "string",
    "skill": "string",
    "difficulty": "string",
    "expectedAreas": ["string"]
}
`;

        const userPrompt = `
=== INTERVIEW ===
Title: ${context.interview.title}
Description: ${context.interview.description || "N/A"}

=== JOB ===
Title: ${context.job.title}
Description: ${context.job.description || "N/A"}

=== HISTORY OF PREVIOUS QUESTIONS AND ANSWERS ===
${history.map((h, i) => `Q${i + 1}: ${h.question}\nCandidate: ${h.answer}`).join("\n\n")}

=== CONFIGURATION ===
Difficulty: ${context.configuration.difficulty}

Generate the next main question.
`;

        return { systemPrompt, userPrompt };
    }

    static buildAnswerEvaluationAndProgressionPrompt(
        context: AIQuestionProgressionContext,
        history: { question: string; answer: string; score: number }[],
        allowFollowUps: boolean
    ): AIGeneratedPrompt {
        const systemPrompt = `
You are an expert AI interviewer evaluating a candidate's answer and deciding progression.
Evaluate the answer strictly based on correctness, technical understanding, and expected areas.
Score the answer between 0 and 100.

Also, determine if a follow-up question is required (shouldFollowUp). Follow-up questions are only allowed if allowFollowUps is true and the candidate missed key concepts or has gaps in their answer.
If shouldFollowUp is true, generate a followUpQuestion. If false, followUpQuestion must be null.

Return ONLY valid JSON:
{
    "evaluation": {
        "score": number,
        "evaluation": "string",
        "strengths": ["string"],
        "weaknesses": ["string"]
    },
    "progression": {
        "shouldFollowUp": boolean,
        "reason": "string",
        "followUpQuestion": {
            "question": "string",
            "topic": "string",
            "skill": "string",
            "difficulty": "string",
            "expectedAreas": ["string"]
        } | null
    }
}
`;

        const userPrompt = `
CURRENT QUESTION:
${context.currentQuestion}

EXPECTED AREAS:
${context.expectedAreas.join(", ")}

CANDIDATE ANSWER:
${context.candidateAnswer}

ALLOW FOLLOW-UPS:
${allowFollowUps}

=== INTERVIEW HISTORY ===
${history.map((h, i) => `Q${i + 1}: ${h.question}\nAnswer: ${h.answer}\nScore: ${h.score}`).join("\n\n")}

Evaluate the current answer and determine progression.
`;

        return { systemPrompt, userPrompt };
    }

    static buildFinalInterviewEvaluationPrompt(
        context: AIInterviewFinalEvaluationContext
    ): AIGeneratedPrompt {
        const systemPrompt = `
You are the final evaluator of an AI-powered technical interview.
Your task is to generate a comprehensive, structured final evaluation based ONLY on the supplied interview data, job details, and complete Q&A history.

Follow these rules:
1. Evaluate candidate performance strictly based on the provided questions, candidate answers, and per-question evaluations.
2. overallScore must be a number between 0 and 100 representing the holistic interview score.
3. recommendation MUST be one of: "STRONG_HIRE", "HIRE", "HOLD", "REJECT", "STRONG_REJECT".
4. summary must provide a clear 2-4 sentence executive summary of the candidate's technical capabilities and interview performance.
5. strengths must list key candidate strengths demonstrated during the interview.
6. weaknesses must list areas where the candidate struggled or showed gaps.
7. skillAssessment must assess each technical skill evaluated with a score (0-100) and actionable feedback.
8. Do NOT evaluate based on unprovided information.
9. Return ONLY valid JSON matching this schema:
{
    "overallScore": 85,
    "recommendation": "STRONG_HIRE",
    "summary": "string",
    "strengths": ["string"],
    "weaknesses": ["string"],
    "skillAssessment": [
        {
            "skill": "string",
            "score": 85,
            "feedback": "string"
        }
    ]
}
Do not include markdown code fences, explanations, or text outside the JSON object.
`;

        const userPrompt = `
=== INTERVIEW DETAILS ===
Title: ${context.interview.title}
Description: ${context.interview.description || "N/A"}
Instructions: ${context.interview.instructions || "N/A"}

=== JOB DETAILS ===
Title: ${context.job.title}
Description: ${context.job.description || "N/A"}
Requirements: ${context.job.requirements || "N/A"}
Required Skills: ${context.job.skills?.join(", ") || "N/A"}

=== AI CONFIGURATION ===
Target Question Count: ${context.configuration.questionCount}
Difficulty: ${context.configuration.difficulty}

=== COMPLETE INTERVIEW HISTORY ===
${context.questions.map(q => `
Question #${q.sequence} [Topic: ${q.topic || "N/A"}, Skill: ${q.skill || "N/A"}, Difficulty: ${q.difficulty || "N/A"}]:
Q: ${q.question}
Expected Areas: ${q.expectedAreas.join(", ")}
Candidate Answer: ${q.candidateAnswer}
Evaluation: Score ${q.evaluation.score}/100 - ${q.evaluation.evaluation}
Strengths: ${q.evaluation.strengths.join("; ")}
Weaknesses: ${q.evaluation.weaknesses.join("; ")}
`).join("\n----------------------------------------\n")}

Generate the final interview evaluation based strictly on this data.
`;

        return { systemPrompt, userPrompt };
    }
}

export class AIQuestionService {
    static async generateFirstQuestion(sessionId: string) {
        const existingQuestions = await AIInterviewQuestionsRepository.getQuestionsBySessionId(sessionId);
        if (existingQuestions.length > 0) {
            return existingQuestions[0]!;
        }

        const session = await InterviewSessionsRepositories.findSessionWithJobAndAIConfig(sessionId);
        if (!session) {
            throw new NotFoundError(`Interview session with ID "${sessionId}" not found.`);
        }

        const { interview } = session;
        if (!interview) {
            throw new NotFoundError(`No interview associated with session "${sessionId}".`);
        }

        if (!interview.aiConfiguration) {
            throw new BadRequestError(`AI configuration not found for interview "${interview.id}".`);
        }

        const assignmentParticipant = session.participants?.find(p => p.assignment?.application?.job);
        const job = assignmentParticipant?.assignment?.application?.job || interview.jobInterviews[0]?.job;
        if (!job) {
            throw new NotFoundError("No job associated with this interview session.");
        }

        const context: AIInterviewGenerationContext = {
            interview: {
                title: interview.title,
                description: interview.description,
                instructions: interview.instructions,
            },
            job: {
                title: job.title,
                description: job.description,
                requirements: null,
                skills: job.skills.map(s => s.name),
            },
            configuration: {
                questionCount: interview.aiConfiguration.questionCount,
                difficulty: interview.aiConfiguration.difficulty,
                allowFollowUps: interview.aiConfiguration.allowFollowUps,
                systemPrompt: interview.aiConfiguration.systemPrompt,
                evaluationMetrics: interview.aiConfiguration.evaluationMetrics ?? undefined,
            },
        };

        const prompts = AIinterviewPromptService.buildInitialQuestionPrompt(context);
        const responseContent = await OpenRouterClient.generateText({
            systemPrompt: prompts.systemPrompt,
            userPrompt: prompts.userPrompt,
        });

        let parsed: unknown;
        try {
            const cleaned = cleanJsonResponse(responseContent);
            parsed = JSON.parse(cleaned);
        } catch (error: any) {
            throw new BadRequestError(`Failed to parse AI response as JSON: ${error.message}`);
        }

        const result = AIGeneratedQuestionSchema.safeParse(parsed);
        if (!result.success) {
            console.error("[generateFirstQuestion] Zod Validation Error:", result.error);
            throw new BadRequestError(`AI returned an invalid question structure: ${result.error.issues.map(i => i.message).join(", ")}`);
        }

        return AIInterviewQuestionsRepository.createQuestion({
            sessionId,
            sequence: 1,
            question: result.data.question,
            topic: result.data.topic ?? null,
            skill: result.data.skill ?? null,
            difficulty: result.data.difficulty || interview.aiConfiguration.difficulty || null,
            expectedAreas: result.data.expectedAreas,
        });
    }

    static async generateNextQuestion(
        sessionId: string,
        currentSequence: number,
        history: { question: string; answer: string }[]
    ) {
        const session = await InterviewSessionsRepositories.findSessionWithJobAndAIConfig(sessionId);
        if (!session) {
            throw new NotFoundError(`Interview session with ID "${sessionId}" not found.`);
        }

        const { interview } = session;
        if (!interview) {
            throw new NotFoundError(`No interview associated with session "${sessionId}".`);
        }

        if (!interview.aiConfiguration) {
            throw new BadRequestError(`AI configuration not found for interview "${interview.id}".`);
        }

        const assignmentParticipant = session.participants?.find(p => p.assignment?.application?.job);
        const job = assignmentParticipant?.assignment?.application?.job || interview.jobInterviews[0]?.job;
        if (!job) {
            throw new NotFoundError("No job associated with this interview session.");
        }

        const context: AIInterviewGenerationContext = {
            interview: {
                title: interview.title,
                description: interview.description,
                instructions: interview.instructions,
            },
            job: {
                title: job.title,
                description: job.description,
                requirements: null,
                skills: job.skills.map(s => s.name),
            },
            configuration: {
                questionCount: interview.aiConfiguration.questionCount,
                difficulty: interview.aiConfiguration.difficulty,
                allowFollowUps: interview.aiConfiguration.allowFollowUps,
                systemPrompt: interview.aiConfiguration.systemPrompt,
                evaluationMetrics: interview.aiConfiguration.evaluationMetrics ?? undefined,
            },
        };

        const prompts = AIinterviewPromptService.buildNextQuestionPrompt(context, history);
        const responseContent = await OpenRouterClient.generateText({
            systemPrompt: prompts.systemPrompt,
            userPrompt: prompts.userPrompt,
        });

        let parsed: unknown;
        try {
            const cleaned = cleanJsonResponse(responseContent);
            parsed = JSON.parse(cleaned);
        } catch (error: any) {
            throw new BadRequestError(`Failed to parse AI response as JSON: ${error.message}`);
        }

        const result = AIGeneratedQuestionSchema.safeParse(parsed);
        if (!result.success) {
            console.error("[generateFirstQuestion] Zod Validation Error:", result.error);
            throw new BadRequestError(`AI returned an invalid question structure: ${result.error.issues.map(i => i.message).join(", ")}`);
        }

        return AIInterviewQuestionsRepository.createQuestion({
            sessionId,
            sequence: currentSequence + 1,
            question: result.data.question,
            topic: result.data.topic ?? null,
            skill: result.data.skill ?? null,
            difficulty: result.data.difficulty || interview.aiConfiguration.difficulty || null,
            expectedAreas: result.data.expectedAreas,
        });
    }
}

export class AIInterviewSessionService {
    static async validateAndGetCurrentQuestion(
        sessionId: string,
        userId: string
    ): Promise<{
        sessionId: string;
        status: "IN_PROGRESS" | "COMPLETED" | "EXPIRED" | "CANCELLED" | "SCHEDULED";
        question?: {
            sessionId: string;
            questionId: string;
            sequence: number;
            question: string;
            topic?: string | null;
            skill?: string | null;
            difficulty?: unknown;
        } | null;
        message?: string;
        reason?: string;
    }> {
        const session = await InterviewSessionsRepositories.findSessionWithJobAndAIConfig(sessionId);
        if (!session) {
            throw new NotFoundError("Session not found");
        }

        const participant = await InterviewSessionParticipantsRepositories.findParticipantForSession(userId, sessionId);
        if (!participant) {
            throw new BadRequestError("You are not a participant of this interview");
        }

        if (participant.participantType !== "CANDIDATE") {
            throw new BadRequestError("Only candidates can access this interview session");
        }

        if (session.interview.type !== "AI") {
            throw new BadRequestError("This is not an AI interview");
        }

        if (!session.interview.aiConfiguration) {
            throw new BadRequestError("AI configuration not found for this interview");
        }

        if (session.status === "COMPLETED") {
            return {
                sessionId,
                status: "COMPLETED"
            };
        }

        if (session.status === "EXPIRED" || session.status === "CANCELLED") {
            return {
                sessionId,
                status: session.status,
                reason: "SESSION_EXPIRED"
            };
        }

        if (session.status === "IN_PROGRESS" && session.startedAt) {
            const durationMinutes = session.interview.durationMinutes ?? 30;
            const expiresAt = new Date(session.startedAt.getTime() + durationMinutes * 60 * 1000);
            if (new Date() >= expiresAt) {
                await AIInterviewQuestionsRepository.markSessionExpired(sessionId);
                try {
                    await AIInterviewFinalEvaluationService.generateFinalEvaluation(sessionId);
                } catch (err: any) {
                    console.error(`Final AI evaluation on timeout failed for session "${sessionId}":`, err.message);
                }
                return {
                    sessionId,
                    status: "EXPIRED",
                    reason: "TIME_LIMIT_REACHED"
                };
            }
        }

        if (session.status === "SCHEDULED") {
            await prisma.interviewSession.update({
                where: { id: sessionId },
                data: {
                    status: "IN_PROGRESS",
                    startedAt: new Date()
                }
            });
            const durationMinutes = session.interview.durationMinutes ?? 30;
            AIInterviewTimeoutWorker.scheduleTimeoutJob(sessionId, durationMinutes);
        }

        const questions = await AIInterviewQuestionsRepository.getQuestionsBySessionId(sessionId);

        const unansweredQuestion = questions.find(q => !q.answer);
        if (unansweredQuestion) {
            return {
                sessionId,
                status: "IN_PROGRESS",
                question: {
                    sessionId,
                    questionId: unansweredQuestion.id,
                    sequence: unansweredQuestion.sequence,
                    question: unansweredQuestion.question,
                    topic: unansweredQuestion.topic,
                    skill: unansweredQuestion.skill,
                    difficulty: unansweredQuestion.difficulty
                }
            };
        }

        if (questions.length === 0) {
            const firstQuestion = await AIQuestionService.generateFirstQuestion(sessionId);
            return {
                sessionId,
                status: "IN_PROGRESS",
                question: {
                    sessionId,
                    questionId: firstQuestion.id,
                    sequence: firstQuestion.sequence,
                    question: firstQuestion.question,
                    topic: firstQuestion.topic,
                    skill: firstQuestion.skill,
                    difficulty: firstQuestion.difficulty
                }
            };
        }

        const mainQuestionsCount = questions.filter(q => q.parentAIQuestionId === null).length;
        const config = session.interview.aiConfiguration;
        const maxTotalQuestions = Math.min(Math.max(config.questionCount + 2, 7), 8);

        if (mainQuestionsCount >= config.questionCount || questions.length >= maxTotalQuestions) {
            await AIInterviewCompletionService.finalizeSession(sessionId);
            return {
                sessionId,
                status: "COMPLETED",
                message: "Thank you for completing your AI technical interview! Your responses have been successfully recorded and submitted to the hiring team for evaluation."
            };
        }

        const maxSequence = questions.reduce((max, q) => Math.max(max, q.sequence), 0);
        const historyForNextPrompt = questions.filter(q => q.answer).map(q => ({
            question: q.question,
            answer: q.answer!.answerText
        }));

        const nextMainQuestion = await AIQuestionService.generateNextQuestion(
            sessionId,
            maxSequence,
            historyForNextPrompt
        );

        return {
            sessionId,
            status: "IN_PROGRESS",
            question: {
                sessionId,
                questionId: nextMainQuestion.id,
                sequence: nextMainQuestion.sequence,
                question: nextMainQuestion.question,
                topic: nextMainQuestion.topic,
                skill: nextMainQuestion.skill,
                difficulty: nextMainQuestion.difficulty
            }
        };
    }

    static async submitAnswer(data: {
        userId: string;
        sessionId: string;
        questionId: string;
        answerText: string;
        recordingUrl: string | null;
    }) {
        const { userId, sessionId, questionId, answerText, recordingUrl } = data;

        if (!answerText || !answerText.trim()) {
            throw new BadRequestError("Answer text cannot be empty or whitespace");
        }

        const session = await InterviewSessionsRepositories.findSessionWithJobAndAIConfig(sessionId);
        if (!session) {
            throw new NotFoundError("Session not found");
        }

        if (session.status !== "IN_PROGRESS") {
            throw new BadRequestError(`Interview session is not in progress (current status: ${session.status})`);
        }

        if (session.startedAt) {
            const durationMinutes = session.interview.durationMinutes ?? 30;
            const expiresAt = new Date(session.startedAt.getTime() + durationMinutes * 60 * 1000);
            if (new Date() >= expiresAt) {
                await AIInterviewQuestionsRepository.markSessionExpired(sessionId);
                try {
                    await AIInterviewFinalEvaluationService.generateFinalEvaluation(sessionId);
                } catch (err: any) {
                    console.error(`Final AI evaluation on submitAnswer timeout failed for session "${sessionId}":`, err.message);
                }
                throw new BadRequestError("Interview time limit reached");
            }
        }

        const participant = await InterviewSessionParticipantsRepositories.findParticipantForSession(userId, sessionId);
        if (!participant) {
            throw new BadRequestError("You are not a participant of this interview");
        }

        if (participant.participantType !== "CANDIDATE") {
            throw new BadRequestError("Only candidates can submit answers");
        }

        if (session.interview.type !== "AI") {
            throw new BadRequestError("This is not an AI interview");
        }

        if (!session.interview.aiConfiguration) {
            throw new BadRequestError("AI configuration not found for this interview");
        }

        const questions = await AIInterviewQuestionsRepository.getQuestionsBySessionId(sessionId);
        if (questions.length === 0) {
            throw new BadRequestError("No AI interview questions found");
        }

        const question = questions.find(q => q.id === questionId);
        if (!question) {
            throw new NotFoundError("Question not found in this session");
        }

        if (question.sessionId !== sessionId) {
            throw new BadRequestError("Question does not belong to this session");
        }

        const currentUnanswered = questions.find(q => !q.answer);
        if (currentUnanswered && currentUnanswered.id !== questionId && !question.answer) {
            throw new BadRequestError("This question is not the currently active question");
        }

        let answerId: string;
        let answeredAt: Date;

        if (question.answer) {
            if (question.answer.evaluation) {
                throw new BadRequestError("Question already answered and evaluated");
            }
            answerId = question.answer.id;
            answeredAt = question.answer.answeredAt;
        } else {
            const newAnswer = await AIInterviewQuestionsRepository.saveAnswer({
                questionId,
                answerText: answerText.trim(),
                recordingUrl
            });
            answerId = newAnswer.id;
            answeredAt = newAnswer.answeredAt;
        }

        let progressionResult: Awaited<ReturnType<typeof AIQuestionProgressionService.evaluateAndProgress>>;
        try {
            progressionResult = await AIQuestionProgressionService.evaluateAndProgress(
                answerId,
                question,
                answerText,
                session
            );
        } catch (error: any) {
            console.error(`[AIInterviewSessionService] OpenRouter failure processing answer for question "${questionId}":`, error.message);
            throw new AIProcessingError("We could not process your answer right now. Please try again.");
        }

        return {
            submittedQuestionId: questionId,
            answerSubmitted: true,
            answerId,
            submittedAt: answeredAt,
            evaluation: progressionResult.evaluation,
            nextQuestion: progressionResult.nextQuestion ? {
                sessionId: session.id,
                questionId: progressionResult.nextQuestion.id,
                sequence: progressionResult.nextQuestion.sequence,
                question: progressionResult.nextQuestion.question,
                topic: progressionResult.nextQuestion.topic,
                skill: progressionResult.nextQuestion.skill,
                difficulty: progressionResult.nextQuestion.difficulty
            } : null,
            completed: progressionResult.completed,
            sendOffMessage: progressionResult.completed ? (progressionResult as any).sendOffMessage || "Thank you for completing your AI technical interview! Your responses have been successfully recorded and submitted to the hiring team for evaluation." : null,
            result: progressionResult.completed ? progressionResult.result : null
        };
    }
}

export class AIQuestionProgressionService {
    static async evaluateAndProgress(
        answerId: string,
        question: {
            id: string;
            question: string;
            topic?: string | null;
            skill?: string | null;
            difficulty?: unknown;
            expectedAreas: unknown;
            parentAIQuestionId?: string | null;
        },
        answerText: string,
        session: {
            id: string;
            interview: {
                aiConfiguration: {
                    questionCount: number;
                    difficulty: unknown;
                    allowFollowUps: boolean;
                    systemPrompt?: string | null;
                    evaluationMetrics?: unknown;
                } | null;
            };
        }
    ) {
        const config = session.interview.aiConfiguration;
        if (!config) {
            throw new BadRequestError("AI configuration not found");
        }

        const fullHistory = await AIInterviewQuestionsRepository.getSessionHistory(session.id);
        const previousHistory = fullHistory.filter(q => q.id !== question.id && q.answer);
        const promptHistory = previousHistory.map(q => ({
            question: q.question,
            answer: q.answer!.answerText,
            score: q.answer!.evaluation?.score ?? 0
        }));

        let followUpDepth = 0;
        let curr: typeof question | undefined = question;
        while (curr?.parentAIQuestionId) {
            followUpDepth++;
            const parent = fullHistory.find(q => q.id === curr!.parentAIQuestionId);
            if (!parent) break;
            curr = parent;
        }

        const allowFollowUps = config.allowFollowUps && (followUpDepth < 2);

        const context: AIQuestionProgressionContext = {
            currentQuestion: question.question,
            candidateAnswer: answerText,
            evaluation: {
                score: 0,
                evaluation: "",
                strengths: [],
                weaknesses: []
            },
            allowFollowUps,
            topic: question.topic ?? null,
            skill: question.skill ?? null,
            difficulty: question.difficulty ? String(question.difficulty) : null,
            expectedAreas: (question.expectedAreas as string[]) || []
        };

        const prompts = AIinterviewPromptService.buildAnswerEvaluationAndProgressionPrompt(
            context,
            promptHistory,
            allowFollowUps
        );

        const response = await OpenRouterClient.generateText({
            systemPrompt: prompts.systemPrompt,
            userPrompt: prompts.userPrompt
        });

        let parsed: unknown;
        try {
            const cleaned = cleanJsonResponse(response);
            parsed = JSON.parse(cleaned);
        } catch {
            throw new BadRequestError("AI returned an invalid JSON response for evaluation and progression");
        }

        const combinedResult = AICombinedEvaluationAndProgressionValidator.parse(parsed);

        const savedEvaluation = await AIInterviewEvaluationRepository.create({
            answerId,
            score: combinedResult.evaluation.score,
            evaluation: combinedResult.evaluation.evaluation,
            strengths: combinedResult.evaluation.strengths,
            weaknesses: combinedResult.evaluation.weaknesses
        });

        const mainQuestionsCount = fullHistory.filter(q => q.parentAIQuestionId === null).length;
        const maxTotalQuestions = Math.min(Math.max(config.questionCount + 2, 7), 8);

        if (mainQuestionsCount >= config.questionCount || fullHistory.length >= maxTotalQuestions) {
            const completionResult = await AIInterviewCompletionService.finalizeSession(session.id);
            return {
                evaluation: savedEvaluation,
                nextQuestion: null,
                completed: true,
                sendOffMessage: "Thank you for completing your AI technical interview! Your responses have been successfully recorded and submitted to the hiring team for evaluation.",
                result: completionResult.aiResult
            };
        }

        const decision = combinedResult.progression;
        if (decision.shouldFollowUp && decision.followUpQuestion && fullHistory.length < maxTotalQuestions) {
            const maxSequence = fullHistory.reduce((max, q) => Math.max(max, q.sequence), 0);
            const followUpQuestion = await AIInterviewQuestionsRepository.createQuestion({
                sessionId: session.id,
                sequence: maxSequence + 1,
                parentAIQuestionId: question.id,
                question: decision.followUpQuestion.question,
                topic: decision.followUpQuestion.topic ?? question.topic ?? null,
                skill: decision.followUpQuestion.skill ?? question.skill ?? null,
                difficulty: (decision.followUpQuestion.difficulty as QuestionDifficulty | null) ?? (question.difficulty as QuestionDifficulty | null) ?? (config.difficulty as QuestionDifficulty | null) ?? null,
                expectedAreas: decision.followUpQuestion.expectedAreas
            });
            return {
                evaluation: savedEvaluation,
                nextQuestion: followUpQuestion,
                completed: false
            };
        }

        const historyForNextPrompt = fullHistory.filter(q => q.answer).map(q => ({
            question: q.question,
            answer: q.answer!.answerText
        }));

        const maxSequence = fullHistory.reduce((max, q) => Math.max(max, q.sequence), 0);
        const nextMainQuestion = await AIQuestionService.generateNextQuestion(
            session.id,
            maxSequence,
            historyForNextPrompt
        );

        return {
            evaluation: savedEvaluation,
            nextQuestion: nextMainQuestion,
            completed: false
        };
    }
}

export const interviewEvents = new EventEmitter();

export class AIInterviewCompletionService {
    static async finalizeSession(sessionId: string) {
        const updatedSession = await prisma.interviewSession.update({
            where: { id: sessionId },
            data: {
                status: "COMPLETED",
                endedAt: new Date()
            }
        });

        let finalResult: any = null;
        try {
            finalResult = await AIInterviewFinalEvaluationService.generateFinalEvaluation(sessionId);
        } catch (error: any) {
            console.error(`Final AI evaluation generation failed for session "${sessionId}":`, error.message);
        }

        interviewEvents.emit("InterviewCompleted", {
            sessionId,
            interviewId: updatedSession.interviewId,
            overallScore: finalResult?.overallScore ?? 0,
            recommendation: finalResult?.recommendation ?? "HOLD",
            completedAt: updatedSession.endedAt
        });

        return { updatedSession, aiResult: finalResult };
    }
}