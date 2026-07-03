import { z } from "zod";
import { emailValidator, passwordValidator } from "../../../common/validators/validators.js";

export const registerCandidateDto = z.object({
    email: emailValidator,
    password: passwordValidator,
    fullName: z.string().trim().min(1, "Full name is required").max(100)
    
});

export type RegisterCandidateDto = z.infer<typeof registerCandidateDto>;