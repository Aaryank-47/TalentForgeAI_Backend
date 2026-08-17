import { z } from "zod";
import {
    aiInterviewQuestionSequenceValidator,
    aiInterviewQuestionTextValidator,
    aiInterviewQuestionTopicValidator,
    aiInterviewQuestionSkillValidator,
    aiInterviewQuestionDifficultyValidator,
    aiInterviewAnswerTextValidator
} from "../../../../common/validators/validators.js";

export const AIGeneratedQuestionsSchema = z.object({
    questions: z.array(
        z.object({
            sequence: aiInterviewQuestionSequenceValidator,
            question: aiInterviewQuestionTextValidator,
            topic: aiInterviewQuestionTopicValidator,
            skill: aiInterviewQuestionSkillValidator,
            difficulty: aiInterviewQuestionDifficultyValidator,
            expectedAreas: z.array(z.string()).optional()
        })
    )
});

export type AIGeneratedQuestionsDto = z.infer<typeof AIGeneratedQuestionsSchema>;

export const generateFollowUpDto = z.object({
    answerText: aiInterviewAnswerTextValidator
});

export type GenerateFollowUpRequest = z.infer<typeof generateFollowUpDto>;

export const aiFollowUpQuestionResponseSchema = z.object({
    question: z.string().trim().min(5, "Question must be at least 5 characters long"),
    expectedAreas: z.array(z.string()).optional()
});

export type AIInterviewFollowUpQuestionResponse = z.infer<typeof aiFollowUpQuestionResponseSchema>;
