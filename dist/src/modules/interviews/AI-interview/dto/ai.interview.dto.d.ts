import { z } from "zod";
export declare const AIGeneratedQuestionsSchema: z.ZodObject<{
    questions: z.ZodArray<z.ZodObject<{
        sequence: z.ZodNumber;
        question: z.ZodString;
        topic: z.ZodOptional<z.ZodString>;
        skill: z.ZodOptional<z.ZodString>;
        difficulty: z.ZodOptional<z.ZodEnum<{
            EASY: "EASY";
            MEDIUM: "MEDIUM";
            HARD: "HARD";
        }>>;
        expectedAreas: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type AIGeneratedQuestionsDto = z.infer<typeof AIGeneratedQuestionsSchema>;
export declare const AIEvaluationValidator: z.ZodObject<{
    score: z.ZodNumber;
    evaluation: z.ZodString;
    strengths: z.ZodArray<z.ZodString>;
    weaknesses: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type AIEvaluationResponse = z.infer<typeof AIEvaluationValidator>;
export declare const AIQuestionProgressionValidator: z.ZodObject<{
    shouldFollowUp: z.ZodBoolean;
    reason: z.ZodString;
    followUpQuestion: z.ZodNullable<z.ZodObject<{
        question: z.ZodString;
        topic: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
        skill: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
        difficulty: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            EASY: "EASY";
            MEDIUM: "MEDIUM";
            HARD: "HARD";
        }>>>>;
        expectedAreas: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>, z.ZodTransform<string[], string[] | null | undefined>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type AIQuestionProgressionResultDto = z.infer<typeof AIQuestionProgressionValidator>;
export declare const AIGeneratedQuestionSchema: z.ZodObject<{
    question: z.ZodString;
    topic: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    skill: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    difficulty: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
        EASY: "EASY";
        MEDIUM: "MEDIUM";
        HARD: "HARD";
    }>>>>;
    expectedAreas: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>, z.ZodTransform<string[], string[] | null | undefined>>;
}, z.core.$strip>;
export declare const AICombinedEvaluationAndProgressionValidator: z.ZodObject<{
    evaluation: z.ZodObject<{
        score: z.ZodNumber;
        evaluation: z.ZodString;
        strengths: z.ZodArray<z.ZodString>;
        weaknesses: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
    progression: z.ZodObject<{
        shouldFollowUp: z.ZodBoolean;
        reason: z.ZodString;
        followUpQuestion: z.ZodNullable<z.ZodObject<{
            question: z.ZodString;
            topic: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
            skill: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
            difficulty: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                EASY: "EASY";
                MEDIUM: "MEDIUM";
                HARD: "HARD";
            }>>>>;
            expectedAreas: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>, z.ZodTransform<string[], string[] | null | undefined>>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type AICombinedEvaluationAndProgression = z.infer<typeof AICombinedEvaluationAndProgressionValidator>;
//# sourceMappingURL=ai.interview.dto.d.ts.map