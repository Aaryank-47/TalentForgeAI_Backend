import { z } from "zod";
import { candidateFullNameValidator, emailValidator, phoneNumberValidator, currentLocationValidator, linkedInUrlValidator, githubUrlValidator, portfolioUrlValidator, websiteUrlValidator, headlineValidator, bioValidator, currentCompanyValidator, currentDesignationValidator, totalExperienceValidator, skillNameValidator, skillExperienceValidator, companyNameValidator, experienceDesignationValidator, employmentTypeValidator, experienceDescriptionValidator, experienceLocationValidator, currentlyWorkingValidator, collegeValidator, degreeValidator, fieldOfStudyValidator, currentlyStudyingValidator, gradingSystemValidator, gradeTextValidator, gradeValidator } from "../../../common/validators/validators.js";
export const personalInfoSchema = z.object({
    fullName: candidateFullNameValidator.nullable(),
    email: emailValidator.nullable(),
    phoneNumber: phoneNumberValidator.nullable(),
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
    name: skillNameValidator,
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
    fieldOfStudy: fieldOfStudyValidator,
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