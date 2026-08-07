import { z } from "zod";

export const tokenParamSchema = z.object({
    token: z.string().min(1, "Token is required")
});

export type TokenParamDto = z.infer<typeof tokenParamSchema>;
