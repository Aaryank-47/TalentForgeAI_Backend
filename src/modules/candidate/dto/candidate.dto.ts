import z from "zod";
import {
    candidateIdValidator,
    candidateFullNameValidator,
    phoneNumberValidator,
    profilePictureValidator,
    headlineValidator,
    bioValidator,
    dateOfBirthValidator,
    genderValidator,
    experienceLevelValidator,
    currentLocationValidator,
    preferredLocationValidator,
    currentCompanyValidator,
    currentDesignationValidator,
    totalExperienceValidator,
    expectedSalaryValidator,
    currentSalaryValidator,
    noticePeriodValidator,
    resumeFileValidator,
    linkedInUrlValidator,
    githubUrlValidator,
    portfolioUrlValidator,
    websiteUrlValidator,
    isOpenToWorkValidator,
    skillNameValidator,
    skillExperienceValidator,
    proficiencyValidator
} from "../../../common/validators/validators.js";

export const candidateIdParamDto = z.object({
    candidateId: candidateIdValidator,
});

export type CandidateIdParamDto = z.infer<typeof candidateIdParamDto>;

export const updateCandidateProfileDto = z.object({
    fullName: candidateFullNameValidator.optional(),
    phoneNumber: phoneNumberValidator.optional(),
    profilePicture: profilePictureValidator.optional(),
    headline: headlineValidator.optional(),
    bio: bioValidator.optional(),
    dateOfBirth: dateOfBirthValidator.optional(),
    gender: genderValidator.optional(),
    experienceLevel: experienceLevelValidator.optional(),
    currentLocation: currentLocationValidator.optional(),
    preferredLocation: preferredLocationValidator.optional(),
    currentCompany: currentCompanyValidator.optional(),
    currentDesignation: currentDesignationValidator.optional(),
    totalExperience: totalExperienceValidator.optional(),
    expectedSalary: expectedSalaryValidator.optional(),
    currentSalary: currentSalaryValidator.optional(),
    noticePeriod: noticePeriodValidator.optional(),
    resumeUrl: resumeFileValidator.optional(),
    linkedinUrl: linkedInUrlValidator.optional(),
    githubUrl: githubUrlValidator.optional(),
    portfolioUrl: portfolioUrlValidator.optional(),
    websiteUrl: websiteUrlValidator.optional(),
    isOpenToWork: isOpenToWorkValidator.optional()
});

export type UpdateCandidateProfileDto = z.infer<typeof updateCandidateProfileDto>;

export const resumeUploadDto = z.object({
    resume: resumeFileValidator
})

export type ResumeUploadDto = z.infer<typeof resumeUploadDto>

export const deleteResumesDto = z.object({
    resumeIds: z.array(z.string()).min(1, "At least one resume ID is required")
});

export type DeleteResumesDto = z.infer<typeof deleteResumesDto>;

export const singleSkillDto = z.object({
    skillName: skillNameValidator,
    skillExperience: skillExperienceValidator
});

export type SingleSkillDto = z.infer<typeof singleSkillDto>;

export const addSkillsDto = z.object({
    skills: z.array(singleSkillDto).min(1, "At least one skill is required")
});

export type AddSkillsDto = z.infer<typeof addSkillsDto>;