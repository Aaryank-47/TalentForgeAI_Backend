import { OpenRouterClient } from "../../../../common/integrations/openRouter/openrouter.client.js";
import { InterviewSessionsRepositories } from "../../repositories/interviews.repository.js";
import { AIInterviewQuestionsRepository, AIInterviewEvaluationRepository } from "../repositories/ai.interview.repository.js";
import { AIinterviewPromptService } from "./ai.interview.service.js";
import { AIFinalEvaluationValidator } from "../dto/ai.final.evaluation.validator.js";
import { cleanJsonResponse } from "../utils/ai.interview.utils.js";
import { NotFoundError } from "../../../../common/errors/NotFoundError.js";
import { BadRequestError } from "../../../../common/errors/BadRequestError.js";
export class AIInterviewFinalEvaluationService {
    static async generateFinalEvaluation(sessionId) {
        const existingResult = await AIInterviewEvaluationRepository.findFinalEvaluationBySessionId(sessionId);
        if (existingResult) {
            return existingResult;
        }
        const session = await InterviewSessionsRepositories.findSessionWithJobAndAIConfig(sessionId);
        if (!session) {
            throw new NotFoundError(`Interview session with ID "${sessionId}" not found.`);
        }
        const { interview } = session;
        if (!interview) {
            throw new NotFoundError(`No interview associated with session "${sessionId}".`);
        }
        if (interview.type !== "AI") {
            throw new BadRequestError("This is not an AI interview.");
        }
        if (!interview.aiConfiguration) {
            throw new BadRequestError("AI configuration not found for this interview.");
        }
        const assignmentParticipant = session.participants?.find(p => p.assignment?.application?.job);
        const job = assignmentParticipant?.assignment?.application?.job || interview.jobInterviews[0]?.job;
        if (!job) {
            throw new NotFoundError("No job associated with this interview session.");
        }
        const fullHistory = await AIInterviewQuestionsRepository.getSessionHistory(sessionId);
        const validQuestions = fullHistory.filter(q => q.answer && q.answer.evaluation);
        if (validQuestions.length === 0) {
            throw new BadRequestError("Cannot generate final evaluation for an interview with no evaluated answers.");
        }
        const formattedQuestions = validQuestions.map(q => {
            const ev = q.answer.evaluation;
            return {
                sequence: q.sequence,
                question: q.question,
                topic: q.topic,
                skill: q.skill,
                difficulty: q.difficulty ? String(q.difficulty) : null,
                expectedAreas: q.expectedAreas || [],
                candidateAnswer: q.answer.answerText,
                evaluation: {
                    score: ev.score,
                    evaluation: ev.feedback || "",
                    strengths: ev.strengths || [],
                    weaknesses: ev.weaknesses || []
                }
            };
        });
        const context = {
            interview: {
                title: interview.title,
                description: interview.description,
                instructions: interview.instructions
            },
            job: {
                title: job.title,
                description: job.description,
                requirements: job.summary || null,
                skills: job.skills.map(s => s.name)
            },
            configuration: {
                questionCount: interview.aiConfiguration.questionCount,
                difficulty: interview.aiConfiguration.difficulty,
                evaluationMetrics: interview.aiConfiguration.evaluationMetrics,
                systemPrompt: interview.aiConfiguration.systemPrompt
            },
            questions: formattedQuestions
        };
        const prompts = AIinterviewPromptService.buildFinalInterviewEvaluationPrompt(context);
        const responseContent = await OpenRouterClient.generateText({
            systemPrompt: prompts.systemPrompt,
            userPrompt: prompts.userPrompt
        });
        let parsed;
        try {
            const cleaned = cleanJsonResponse(responseContent);
            parsed = JSON.parse(cleaned);
        }
        catch (error) {
            throw new BadRequestError(`Failed to parse final AI evaluation response: ${error.message}`);
        }
        const validated = AIFinalEvaluationValidator.parse(parsed);
        return AIInterviewEvaluationRepository.upsertResult({
            sessionId,
            overallScore: validated.overallScore,
            technicalScore: validated.overallScore,
            communicationScore: validated.overallScore,
            problemSolvingScore: validated.overallScore,
            overallFeedback: validated.summary,
            strengths: validated.strengths,
            weaknesses: validated.weaknesses,
            recommendation: validated.recommendation
        });
    }
    static async getFinalEvaluation(sessionId) {
        const result = await AIInterviewEvaluationRepository.findFinalEvaluationBySessionId(sessionId);
        if (!result) {
            throw new NotFoundError("Final AI evaluation result not found for this session.");
        }
        return result;
    }
    static async getFinalReport(sessionId) {
        const session = await InterviewSessionsRepositories.findSessionWithJobAndAIConfig(sessionId);
        if (!session) {
            throw new NotFoundError(`Interview session with ID "${sessionId}" not found.`);
        }
        const questions = await AIInterviewQuestionsRepository.getSessionHistory(sessionId);
        let finalEvaluation = await AIInterviewEvaluationRepository.findFinalEvaluationBySessionId(sessionId);
        if (!finalEvaluation && session.status === "COMPLETED") {
            try {
                finalEvaluation = await this.generateFinalEvaluation(sessionId);
            }
            catch (err) {
                console.error(`On-demand final evaluation generation failed for session "${sessionId}":`, err.message);
            }
        }
        const assignmentParticipant = session.participants?.find(p => p.assignment?.application?.job);
        const job = assignmentParticipant?.assignment?.application?.job || session.interview.jobInterviews[0]?.job;
        return {
            session: {
                id: session.id,
                status: session.status,
                startedAt: session.startedAt,
                endedAt: session.endedAt,
                interview: {
                    id: session.interview.id,
                    title: session.interview.title,
                    description: session.interview.description,
                    type: session.interview.type
                },
                job: job ? {
                    id: job.id,
                    title: job.title,
                    companyId: job.companyId
                } : null
            },
            questions: questions.map(q => ({
                id: q.id,
                sequence: q.sequence,
                question: q.question,
                topic: q.topic,
                skill: q.skill,
                difficulty: q.difficulty,
                expectedAreas: q.expectedAreas,
                parentAIQuestionId: q.parentAIQuestionId,
                answer: q.answer ? {
                    id: q.answer.id,
                    answerText: q.answer.answerText,
                    recordingUrl: q.answer.recordingUrl,
                    answeredAt: q.answer.answeredAt,
                    evaluation: q.answer.evaluation ? {
                        id: q.answer.evaluation.id,
                        score: q.answer.evaluation.score,
                        feedback: q.answer.evaluation.feedback,
                        strengths: q.answer.evaluation.strengths,
                        weaknesses: q.answer.evaluation.weaknesses
                    } : null
                } : null
            })),
            finalEvaluation
        };
    }
}
//# sourceMappingURL=ai.final.evaluation.service.js.map