import type { AIInterviewGenerationContext, AIGeneratedPrompt } from "../interfaces/ai.interview.interface.js";
import { OpenRouterClient } from "../../../../common/integrations/openRouter/openrouter.client.js";
import { InterviewSessionsRepositories } from "../../repositories/interviews.repository.js";
import { AIInterviewQuestionsRepository } from "../repositories/ai.interview.repository.js";
import { NotFoundError } from "../../../../common/errors/NotFoundError.js";
import { BadRequestError } from "../../../../common/errors/BadRequestError.js";
import { AIGeneratedQuestionsSchema, aiFollowUpQuestionResponseSchema } from "../dto/ai.interview.dto.js";
import { cleanJsonResponse } from "../utils/ai.interview.utils.js";
export class AIinterviewPromptService {
    static buildQuestionGenerationPrompt(
        context: AIInterviewGenerationContext
    ): AIGeneratedPrompt {
        const { interview, job, configuration } = context;

        const defaultSystemPrompt = `
            You are an expert AI interviewer.
            
            Your task is to generate structured interview questions based strictly on
            the provided interview context, job information, requirements, skills,
            and AI interview configuration.
            
            Follow these rules:
            
            1. Generate exactly the requested number of questions.
            2. Questions must be relevant to the supplied job and interview.
            3. Questions must match the requested difficulty.
            4. Questions should assess the supplied requirements and skills.
            5. Do not introduce unrelated technologies, skills, or topics.
            6. Each question must have a unique sequential number starting from 1.
            7. expectedAreas must contain the key concepts that a strong candidate
               should address when answering the question.
            8. Follow-up questions are not generated in this request. If follow-ups
               are enabled, they may be generated later during the interview session.
            9. Return ONLY valid JSON.
            10. Do not return markdown, code fences, HTML, explanations, or any text
                outside the JSON object.
            
            The response must follow this structure:
            
            {
              "questions": [
                {
                  "sequence": 1,
                  "question": "Example question",
                  "topic": "Example topic",
                  "skill": "Example skill",
                  "difficulty": "Easy/MEDIUM/Hard",
                  "expectedAreas": [
                    "Expected concept 1",
                    "Expected concept 2"
                  ]
                }
              ]
            }
            `;

        // Incorporate custom system prompt if provided
        const systemPrompt = configuration.systemPrompt
            ? `${defaultSystemPrompt}\n\nAdditional System Instructions:\n${configuration.systemPrompt}`
            : defaultSystemPrompt;

        const userPrompt = `
                Generate the initial interview questions using the following context.
                
                === INTERVIEW ===
                Title: ${interview.title}
                Description: ${interview.description || "N/A"}
                Instructions: ${interview.instructions || "N/A"}
                
                === JOB ===
                Title: ${job.title}
                Description: ${job.description || "N/A"}
                
                Requirements:
                ${job.requirements || "N/A"}
                
                Required Skills:
                ${job.skills?.length
                ? job.skills.map(skill => `- ${skill}`).join("\n")
                : "N/A"}
                
                === AI INTERVIEW CONFIGURATION ===
                Question Count: ${configuration.questionCount}
                Difficulty: ${configuration.difficulty}
                Follow-up Questions Enabled:
                ${configuration.allowFollowUps ? "Yes" : "No"}
                
                Evaluation Metrics:
                ${configuration.evaluationMetrics
                ? JSON.stringify(configuration.evaluationMetrics)
                : "N/A"
            }
                
                Generate exactly ${configuration.questionCount} questions.
                
                Every question must be relevant to the job requirements and required skills.`;

        return {
            systemPrompt,
            userPrompt
        };
    }

    static buildFollowUpQuestionPrompt(
        parentQuestion: string,
        answerText: string,
        difficulty: string
    ): AIGeneratedPrompt {
        const systemPrompt = `You are an expert AI interviewer.
            
Your task is to analyze the candidate's answer to the previous question and generate a single follow-up question.
            
Follow these rules:
1. The follow-up question must directly challenge or explore the candidate's answer.
2. It must match the requested difficulty level: ${difficulty}.
3. Keep the follow-up concise and clear.
4. Return ONLY valid JSON matching this schema:
   {
     "question": "string",
     "expectedAreas": ["string"]
   }
5. Do not include markdown code fences, explanations, or text outside the JSON object.`;

        const userPrompt = `
Previous Question: "${parentQuestion}"
Candidate's Answer: "${answerText}"

Generate a single follow-up question to probe deeper.`;

        return {
            systemPrompt,
            userPrompt
        };
    }
}

export class AIQuestionService {
    static async generateQuestionsForSession(
        sessionId: string
    ) {
        const session =
            await InterviewSessionsRepositories
                .findSessionWithJobAndAIConfig(sessionId);

        if (!session) {
            throw new NotFoundError(
                `Interview session with ID "${sessionId}" not found.`
            );
        }

        const { interview } = session;

        if (!interview) {
            throw new NotFoundError(
                `No interview associated with session "${sessionId}".`
            );
        }

        if (!interview.aiConfiguration) {
            throw new BadRequestError(
                `AI configuration not found for interview "${interview.id}".`
            );
        }
    
        const assignmentParticipant = session.participants?.find(p => p.assignment?.application?.job);
        const job = assignmentParticipant?.assignment?.application?.job || interview.jobInterviews[0]?.job;

        if (!job) {
            throw new NotFoundError(
                "No job associated with this interview session."
            );
        }

        if (session.aiQuestions && session.aiQuestions.length > 0) {
            throw new BadRequestError(
                "Questions have already been generated for this session."
            );
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
                skills: job.skills.map(
                    skill => skill.name
                ),
            },

            configuration: {
                questionCount:
                    interview.aiConfiguration.questionCount,

                difficulty:
                    interview.aiConfiguration.difficulty,

                allowFollowUps:
                    interview.aiConfiguration.allowFollowUps,

                systemPrompt:
                    interview.aiConfiguration.systemPrompt,

                evaluationMetrics:
                    interview.aiConfiguration.evaluationMetrics
                    ?? undefined,
            },
        };

        const prompts =
            AIinterviewPromptService
                .buildQuestionGenerationPrompt(context);

        const responseContent =
            await OpenRouterClient.generateText({
                systemPrompt: prompts.systemPrompt,
                userPrompt: prompts.userPrompt,
            });

        // 8. Parse
        let parsed: unknown;
        try {
            const cleaned = cleanJsonResponse(responseContent);
            parsed = JSON.parse(cleaned);
        } catch (error: any) {
            throw new BadRequestError(
                `Failed to parse AI response as JSON: ${error.message}. Raw response: ${responseContent}`
            );
        }

        const result =
            AIGeneratedQuestionsSchema.safeParse(parsed);

        if (!result.success) {
            throw new BadRequestError(
                "AI returned an invalid question structure."
            );
        }

        return AIInterviewQuestionsRepository
            .createInterviewQuestions({
                sessionId,
                questions: result.data.questions,
            });
    }

    static async generateFollowUpQuestionForSession(
        sessionId: string,
        parentQuestionId: string,
        answerText: string
    ) {
        const session = await InterviewSessionsRepositories.findSessionWithJobAndAIConfig(sessionId);
        if (!session) {
            throw new NotFoundError(`Interview session with ID "${sessionId}" not found.`);
        }

        const parentQuestion = session.aiQuestions?.find(q => q.id === parentQuestionId);
        if (!parentQuestion) {
            throw new NotFoundError(`Parent question with ID "${parentQuestionId}" not found in this session.`);
        }

        if (parentQuestion.answer) {
            throw new BadRequestError("This question has already been answered.");
        }

        const config = session.interview.aiConfiguration;
        if (!config) {
            throw new BadRequestError("AI configuration not found for this interview.");
        }

        const maxSequence = session.aiQuestions?.reduce((max, q) => Math.max(max, q.sequence), 0) ?? 0;
        const nextSequence = maxSequence + 1;

        const prompts = AIinterviewPromptService.buildFollowUpQuestionPrompt(
            parentQuestion.question,
            answerText,
            parentQuestion.difficulty || config.difficulty
        );

        const responseContent = await OpenRouterClient.generateText({
            systemPrompt: prompts.systemPrompt,
            userPrompt: prompts.userPrompt
        });

        let parsed: unknown;
        try {
            const cleaned = cleanJsonResponse(responseContent);
            parsed = JSON.parse(cleaned);
        } catch (error: any) {
            throw new BadRequestError(`Failed to parse AI response as JSON: ${error.message}`);
        }

        const result = aiFollowUpQuestionResponseSchema.safeParse(parsed);
        if (!result.success) {
            throw new BadRequestError("AI returned an invalid follow-up question structure.");
        }

        const savedData = await AIInterviewQuestionsRepository.saveAnswerAndCreateFollowUp({
            sessionId,
            parentQuestionId,
            answerText,
            followUp: {
                sequence: nextSequence,
                question: result.data.question,
                topic: parentQuestion.topic,
                skill: parentQuestion.skill,
                difficulty: parentQuestion.difficulty || config.difficulty,
                expectedAreas: result.data.expectedAreas || null
            }
        });

        return savedData;
    }
}