import { z } from "zod";
import { QuestionDifficulty } from "@prisma/client";
import {
    aiInterviewQuestionSequenceValidator,
    aiInterviewQuestionTextValidator,
    aiInterviewQuestionTopicValidator,
    aiInterviewQuestionSkillValidator,
    aiInterviewQuestionDifficultyValidator,
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

const safeDifficultyPreprocessor = z.preprocess(
    (val) => {
        if (typeof val === "string") {
            const u = val.toUpperCase();
            if (u === "EASY" || u === "MEDIUM" || u === "HARD") return u;
            if (u.includes("EASY")) return "EASY";
            if (u.includes("HARD")) return "HARD";
            return "MEDIUM";
        }
        return val ?? "MEDIUM";
    },
    z.nativeEnum(QuestionDifficulty).nullable().optional()
);

export const AIQuestionProgressionValidator = z.object({
    shouldFollowUp: z.boolean(),
    reason: z.string(),
    followUpQuestion: z.object({
        question: aiInterviewQuestionTextValidator,
        topic: aiInterviewQuestionTopicValidator.nullable().optional(),
        skill: aiInterviewQuestionSkillValidator.nullable().optional(),
        difficulty: safeDifficultyPreprocessor,
        expectedAreas: z.array(z.string()).nullish().transform(val => val || [])
    }).nullable()
});

export type AIQuestionProgressionResultDto = z.infer<typeof AIQuestionProgressionValidator>;

export const AIGeneratedQuestionSchema = z.object({
    question: aiInterviewQuestionTextValidator,
    topic: aiInterviewQuestionTopicValidator.nullable().optional(),
    skill: aiInterviewQuestionSkillValidator.nullable().optional(),
    difficulty: safeDifficultyPreprocessor,
    expectedAreas: z.array(z.string()).nullish().transform(val => val || [])
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
            topic: aiInterviewQuestionTopicValidator.nullable().optional(),
            skill: aiInterviewQuestionSkillValidator.nullable().optional(),
            difficulty: safeDifficultyPreprocessor,
            expectedAreas: z.array(z.string()).nullish().transform(val => val || [])
        }).nullable()
    })
});

export type AICombinedEvaluationAndProgression = z.infer<typeof AICombinedEvaluationAndProgressionValidator>;