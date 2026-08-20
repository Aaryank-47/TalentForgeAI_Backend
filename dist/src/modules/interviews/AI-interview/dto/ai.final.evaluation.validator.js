import { z } from "zod";
import { AIRecommendation } from "@prisma/client";
export const AIFinalEvaluationValidator = z.object({
    overallScore: z.number().min(0).max(100),
    recommendation: z.nativeEnum(AIRecommendation),
    summary: z.string().min(1, "Summary cannot be empty"),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    skillAssessment: z.array(z.object({
        skill: z.string().min(1),
        score: z.number().min(0).max(100),
        feedback: z.string().min(1)
    }))
});
//# sourceMappingURL=ai.final.evaluation.validator.js.map