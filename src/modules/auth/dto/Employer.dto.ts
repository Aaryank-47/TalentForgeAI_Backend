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

export class UpdateEmployerProfileDto {
    static updateEmployerProfile = z.object({
        fullName: z.string().trim().min(1, "Full name cannot be empty").max(150).optional(),
        phoneNumber: z.string().trim().nullable().optional(),
        designation: z.string().trim().nullable().optional(),
        department: z.string().trim().nullable().optional(),
        profilePicture: z.string().trim().nullable().optional(),
        linkedinUrl: z.string().trim().nullable().optional(),
    });
}

export type UpdateEmployerProfileDtoType = z.infer<typeof UpdateEmployerProfileDto.updateEmployerProfile>;
