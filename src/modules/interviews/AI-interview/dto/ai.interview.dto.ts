import { z } from "zod";
import {
    aiInterviewQuestionSequenceValidator,
    aiInterviewQuestionTextValidator,
    aiInterviewQuestionTopicValidator,
    aiInterviewQuestionSkillValidator,
    aiInterviewQuestionDifficultyValidator,
    aiInterviewAnswerTextValidator,
    aiInterviewEvaluationScoreValidator,
    aiInterviewEvaluationStrengthsValidator,
    aiInterviewEvaluationWeaknessesValidator
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

export const AIEvaluationValidator = z.object({
    score: aiInterviewEvaluationScoreValidator,
    evaluation: z.string().min(1),
    strengths: aiInterviewEvaluationStrengthsValidator,
    weaknesses: aiInterviewEvaluationWeaknessesValidator
});

export type AIEvaluationResponse =
    z.infer<typeof AIEvaluationValidator>;

export const AIQuestionProgressionValidator = z.object({
    shouldFollowUp: z.boolean(),
    reason: z.string(),
    followUpQuestion: z.object({
        question: aiInterviewQuestionTextValidator,
        topic: aiInterviewQuestionTopicValidator.nullable(),
        skill: aiInterviewQuestionSkillValidator.nullable(),
        difficulty: aiInterviewQuestionDifficultyValidator.nullable(),
        expectedAreas: z.array(z.string())
    }).nullable()
});

export type AIQuestionProgressionResultDto = z.infer<typeof AIQuestionProgressionValidator>;

export const AIGeneratedQuestionSchema = z.object({
    question: aiInterviewQuestionTextValidator,
    topic: aiInterviewQuestionTopicValidator.nullable(),
    skill: aiInterviewQuestionSkillValidator.nullable(),
    difficulty: aiInterviewQuestionDifficultyValidator.nullable(),
    expectedAreas: z.array(z.string())
});

export const AICombinedEvaluationAndProgressionValidator = z.object({
    evaluation: z.object({
        score: aiInterviewEvaluationScoreValidator,
        evaluation: z.string().min(1),
        strengths: aiInterviewEvaluationStrengthsValidator,
        weaknesses: aiInterviewEvaluationWeaknessesValidator
    }),
    progression: z.object({
        shouldFollowUp: z.boolean(),
        reason: z.string(),
        followUpQuestion: z.object({
            question: aiInterviewQuestionTextValidator,
            topic: aiInterviewQuestionTopicValidator.nullable(),
            skill: aiInterviewQuestionSkillValidator.nullable(),
            difficulty: aiInterviewQuestionDifficultyValidator.nullable(),
            expectedAreas: z.array(z.string())
        }).nullable()
    })
});

export type AICombinedEvaluationAndProgression = z.infer<typeof AICombinedEvaluationAndProgressionValidator>;
