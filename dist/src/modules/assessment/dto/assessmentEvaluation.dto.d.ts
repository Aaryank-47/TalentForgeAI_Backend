import { z } from "zod";
export declare const runCodeParamsSchema: z.ZodObject<{
    attemptId: z.ZodString;
    questionId: z.ZodString;
}, z.core.$strip>;
export declare const runCodeSchema: z.ZodObject<{
    code: z.ZodString;
    languageId: z.ZodString;
}, z.core.$strict>;
export type RunCodeDto = z.infer<typeof runCodeSchema>;
export declare const manualEvaluationSchema: z.ZodObject<{
    score: z.ZodNumber;
    feedback: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type ManualEvaluationDto = z.infer<typeof manualEvaluationSchema>;
//# sourceMappingURL=assessmentEvaluation.dto.d.ts.map