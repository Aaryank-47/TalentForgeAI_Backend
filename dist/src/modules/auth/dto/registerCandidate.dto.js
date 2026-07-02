import { z } from "zod";
import { ExperienceLevel, Gender } from "@prisma/client";
import { emailValidator, passwordValidator } from "../../../common/validators/validators.js";
const optionalText = z.string().trim().min(1).max(255).optional();
const optionalUrl = z.string().trim().url("Please enter a valid URL").optional();
export const registerCandidateDto = z.object({
    email: emailValidator,
    password: passwordValidator,
    firstName: z.string().trim().min(1, "First name is required").max(100),
    lastName: z.string().trim().min(1, "Last name is required").max(100),
    phone: optionalText,
    profilePicture: optionalUrl,
    headline: optionalText,
    bio: z.string().trim().min(1).max(2000).optional(),
    gender: z.nativeEnum(Gender).optional(),
    experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
    currentLocation: optionalText,
    preferredLocation: optionalText,
    currentCompany: optionalText,
    currentDesignation: optionalText,
    totalExperience: z.number().nonnegative().optional(),
    expectedSalary: z.number().int().nonnegative().optional(),
    currentSalary: z.number().int().nonnegative().optional(),
    noticePeriod: z.number().int().nonnegative().optional(),
    linkedinUrl: optionalUrl,
    githubUrl: optionalUrl,
    portfolioUrl: optionalUrl,
    websiteUrl: optionalUrl,
    isOpenToWork: z.boolean().optional(),
});
//# sourceMappingURL=registerCandidate.dto.js.map