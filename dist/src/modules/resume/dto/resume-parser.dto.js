import { z } from "zod";
import { candidateFullNameValidator, emailValidator, currentLocationValidator, linkedInUrlValidator, githubUrlValidator, portfolioUrlValidator, websiteUrlValidator, headlineValidator, bioValidator, currentCompanyValidator, currentDesignationValidator, totalExperienceValidator, skillExperienceValidator, companyNameValidator, experienceDesignationValidator, employmentTypeValidator, experienceDescriptionValidator, experienceLocationValidator, currentlyWorkingValidator, collegeValidator, degreeValidator, currentlyStudyingValidator, gradingSystemValidator, gradeTextValidator, gradeValidator } from "../../../common/validators/validators.js";
// Flexible phone validator for AI-extracted resume phone numbers (allowing spaces, hyphens, parentheses, country code)
export const resumePhoneNumberValidator = z
    .string()
    .trim()
    .regex(/^(\+?\d{1,4}[\s-]?)?(\(?\d{2,5}\)?[\s-]?)?[\d\s-]{4,15}$/, "Please enter a valid phone number")
    .min(7, "Phone number must be at least 7 digits long")
    .max(25, "Phone number must be at most 25 characters long");
// Flexible skill name validator allowing legitimate short names like "C", "R", "Go", "C++", "C#"
export const resumeSkillNameValidator = z
    .string()
    .trim()
    .min(1, "Skill name must be at least 1 character long")
    .max(100, "Skill name must be at most 100 characters long");
// Field of study validator supporting null when genuinely unavailable (e.g. 10th / Secondary school)
export const resumeFieldOfStudyValidator = z
    .string()
    .trim()
    .min(1, "Field of study must be at least 1 character long")
    .max(150, "Field of study must be at most 150 characters long")
    .nullable();
export const personalInfoSchema = z.object({
    fullName: candidateFullNameValidator.nullable(),
    email: emailValidator.nullable(),
    phoneNumber: resumePhoneNumberValidator.nullable(),
    currentLocation: currentLocationValidator.nullable(),
    linkedinUrl: linkedInUrlValidator.nullable(),
    githubUrl: githubUrlValidator.nullable(),
    portfolioUrl: portfolioUrlValidator.nullable(),
    websiteUrl: websiteUrlValidator.nullable()
});
export const professionalInfoSchema = z.object({
    headline: headlineValidator.nullable(),
    bio: bioValidator.nullable(),
    currentCompany: currentCompanyValidator.nullable(),
    currentDesignation: currentDesignationValidator.nullable(),
    totalExperience: totalExperienceValidator.nullable()
});
export const resumeSkillSchema = z.object({
    name: resumeSkillNameValidator,
    yearsOfExperience: skillExperienceValidator.nullable()
});
export const resumeExperienceSchema = z.object({
    companyName: companyNameValidator,
    designation: experienceDesignationValidator,
    employmentType: employmentTypeValidator.nullable(),
    description: experienceDescriptionValidator.nullable(),
    location: experienceLocationValidator.nullable(),
    startDate: z.string().trim().min(1, "Start date cannot be empty").nullable(),
    endDate: z.string().trim().min(1, "End date cannot be empty").nullable(),
    currentlyWorking: currentlyWorkingValidator
});
export const resumeEducationSchema = z.object({
    collegeName: collegeValidator,
    degree: degreeValidator,
    fieldOfStudy: resumeFieldOfStudyValidator,
    currentlyStudying: currentlyStudyingValidator,
    startDate: z.string().trim().min(1, "Start date cannot be empty").nullable(),
    endDate: z.string().trim().min(1, "End date cannot be empty").nullable(),
    gradingSystem: gradingSystemValidator.nullable(),
    gradeText: gradeTextValidator.nullable(),
    grade: gradeValidator.nullable()
});
export const resumeProjectSchema = z.object({
    name: z.string().trim().min(1, "Project name is required"),
    description: z.string().trim().min(1, "Project description cannot be empty").nullable()
});
export const resumeCertificationSchema = z.object({
    name: z.string().trim().min(1, "Certification name is required")
});
export const resumeParsingSchema = z.object({
    personal: personalInfoSchema,
    professional: professionalInfoSchema,
    skills: z.array(resumeSkillSchema),
    experience: z.array(resumeExperienceSchema),
    education: z.array(resumeEducationSchema),
    projects: z.array(resumeProjectSchema),
    certifications: z.array(resumeCertificationSchema)
});
//# sourceMappingURL=resume-parser.dto.js.map