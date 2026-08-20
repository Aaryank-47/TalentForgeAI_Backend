import { z } from "zod";
export declare const AIFinalEvaluationValidator: z.ZodObject<{
    overallScore: z.ZodNumber;
    recommendation: z.ZodEnum<{
        STRONG_HIRE: "STRONG_HIRE";
        HIRE: "HIRE";
        HOLD: "HOLD";
        REJECT: "REJECT";
        STRONG_REJECT: "STRONG_REJECT";
    }>;
    summary: z.ZodString;
    strengths: z.ZodArray<z.ZodString>;
    weaknesses: z.ZodArray<z.ZodString>;
    skillAssessment: z.ZodArray<z.ZodObject<{
        skill: z.ZodString;
        score: z.ZodNumber;
        feedback: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type AIFinalEvaluationResultDto = z.infer<typeof AIFinalEvaluationValidator>;
//# sourceMappingURL=ai.final.evaluation.validator.d.ts.map