import { z } from "zod";
import { emailValidator, passwordValidator } from "../../../common/validators/validators.js";

export const registerRecruiterDto = z.object({
    email: emailValidator,
    password: passwordValidator,
    firstName: z.string().trim().min(1, "First name is required").max(100),
    lastName: z.string().trim().min(1, "Last name is required").max(100),
    companyId: z.string().trim().min(1, "Company ID is required"),
});

export type RegisterRecruiterDto = z.infer<typeof registerRecruiterDto>;