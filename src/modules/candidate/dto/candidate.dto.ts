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
    linkedInUrlValidator,
    githubUrlValidator,
    portfolioUrlValidator,
    websiteUrlValidator,
    isOpenToWorkValidator,
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
    linkedinUrl: linkedInUrlValidator.optional(),
    githubUrl: githubUrlValidator.optional(),
    portfolioUrl: portfolioUrlValidator.optional(),
    websiteUrl: websiteUrlValidator.optional(),
    isOpenToWork: isOpenToWorkValidator.optional(),
});

export type UpdateCandidateProfileDto = z.infer<typeof updateCandidateProfileDto>;