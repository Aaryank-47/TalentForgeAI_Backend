import { z } from "zod";
import { 
    questionIdValidator, 
    programmingLanguageIdValidator,
    dsaStarterCodeValidator
} from "../../../common/validators/validators.js";

export const runCodeParamsSchema = z.object({
    attemptId: questionIdValidator,
    questionId: questionIdValidator
});

export const runCodeSchema = z.object({
    code: dsaStarterCodeValidator.min(1, "Code content is required"),
    languageId: programmingLanguageIdValidator
}).strict();

export type RunCodeDto = z.infer<typeof runCodeSchema>;

export const manualEvaluationSchema = z.object({
    score: z.number().nonnegative("Score cannot be negative"),
    feedback: z.string().max(1000, "Feedback must be at most 1000 characters long").optional()
}).strict();

export type ManualEvaluationDto = z.infer<typeof manualEvaluationSchema>;
