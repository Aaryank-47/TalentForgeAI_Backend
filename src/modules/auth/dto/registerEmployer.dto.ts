import { z } from "zod";
import { emailValidator, passwordValidator } from "../../../common/validators/validators.js";

export class RegisterEmployerDto {
    static registerEmployer = z.object({
        email: emailValidator,
        password: passwordValidator,
        fullName: z.string().trim().min(1, "Full name is required").max(150),
        companyId: z.string().trim().min(1, "Company ID is required"),
    });
}

export type RegisterEmployerDtoType = z.infer<typeof RegisterEmployerDto.registerEmployer>;