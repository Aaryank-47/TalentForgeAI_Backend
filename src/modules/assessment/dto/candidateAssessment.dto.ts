import { z } from "zod";
import { AttemptStatus } from "@prisma/client";

export const tokenParamSchema = z.object({
    token: z.string().min(1, "Token is required")
});

export type TokenParamDto = z.infer<typeof tokenParamSchema>;

export const startAssessmentAttemptSchema = z.object({
    invitationToken: z.string().min(1, "Invitation token is required")
});

export type StartAssessmentAttemptDto = z.infer<typeof startAssessmentAttemptSchema>;

export const getAttemptsQuerySchema = z.object({
    page: z.preprocess((val) => (val ? Number(val) : 1), z.number().int().positive().default(1)),
    limit: z.preprocess((val) => (val ? Number(val) : 10), z.number().int().positive().default(10)),
    status: z.nativeEnum(AttemptStatus).optional()
});

export type GetAttemptsQueryDto = z.infer<typeof getAttemptsQuerySchema>;
