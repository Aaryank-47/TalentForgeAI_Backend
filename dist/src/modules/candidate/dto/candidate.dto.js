import z from "zod";
import { candidateIdValidator, candidateFullNameValidator, phoneNumberValidator, profilePictureValidator, headlineValidator, bioValidator, dateOfBirthValidator, genderValidator, experienceLevelValidator, currentLocationValidator, preferredLocationValidator, currentCompanyValidator, currentDesignationValidator, totalExperienceValidator, expectedSalaryValidator, currentSalaryValidator, noticePeriodValidator, resumeFileValidator, linkedInUrlValidator, githubUrlValidator, portfolioUrlValidator, websiteUrlValidator, isOpenToWorkValidator, skillNameValidator, skillExperienceValidator, collegeValidator, degreeValidator, fieldOfStudyValidator, startDateValidator, endDateValidator, experienceDesignationValidator, employmentTypeValidator, experienceDescriptionValidator, experienceStartDateValidator, experienceEndDateValidator, isCurrentJobValidator } from "../../../common/validators/validators.js";
const educationBaseSchema = z.object({
    collegeName: collegeValidator,
    degree: degreeValidator,
    fieldOfStudy: fieldOfStudyValidator,
    currentlyStudying: z.boolean().default(false),
    startDate: startDateValidator,
    endDate: endDateValidator,
    gradingSystem: z.enum([
        "PERCENTAGE",
        "CGPA",
        "GPA_4",
        "GPA_5",
        "GPA_10",
        "LETTER_GRADE",
        "PASS_FAIL",
        "OTHER"
    ]),
    gradeText: z.string().trim().optional(),
    grade: z.number().optional()
});
const experienceBaseSchema = z.object({
    companyName: z.string().trim().min(2, "Company name must be at least 2 characters long").max(100, "Company name must be at most 100 characters long"),
    designation: experienceDesignationValidator,
    employmentType: employmentTypeValidator,
    description: experienceDescriptionValidator,
    location: z.string().trim().min(2, "Location must be at least 2 characters long").max(100, "Location must be at most 100 characters long").optional(),
    startDate: experienceStartDateValidator,
    endDate: experienceEndDateValidator,
    currentlyWorking: isCurrentJobValidator.default(false)
});
const singleSkillSchema = z.object({
    skillName: skillNameValidator,
    skillExperience: skillExperienceValidator
});
export class CandidateDto {
    static candidateIdParam = z.object({
        candidateId: candidateIdValidator,
    });
    static updateCandidateProfile = z.object({
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
    static resumeUpload = z.object({
        resume: resumeFileValidator
    });
    static deleteResumes = z.object({
        resumeIds: z.array(z.string()).min(1, "At least one resume ID is required")
    });
    static singleSkill = singleSkillSchema;
    static addSkills = z.object({
        skills: z.array(singleSkillSchema).min(1, "At least one skill is required")
    });
    static updateSkill = z.object({
        skillName: skillNameValidator.optional(),
        skillExperience: skillExperienceValidator.optional()
    });
    static skillsIds = z.object({
        skillIds: z.array(z.string()).min(1, "At least one skill ID is required")
    });
    static addEducation = educationBaseSchema.refine(data => {
        if (!data.currentlyStudying && !data.endDate) {
            return false;
        }
        return true;
    }, {
        message: "End date is required if you are not currently studying",
        path: ["endDate"]
    });
    static updateEducation = educationBaseSchema.partial().refine(data => {
        if (data.currentlyStudying === false && !data.endDate) {
            return false;
        }
        return true;
    }, {
        message: "End date is required if you are not currently studying",
        path: ["endDate"]
    });
    static addExperience = experienceBaseSchema.refine(data => {
        if (!data.currentlyWorking && !data.endDate) {
            return false;
        }
        return true;
    }, {
        message: "End date is required if you are not currently working",
        path: ["endDate"]
    });
    static updateExperience = experienceBaseSchema.partial().refine(data => {
        if (data.currentlyWorking === false && !data.endDate) {
            return false;
        }
        return true;
    }, {
        message: "End date is required if you are not currently working",
        path: ["endDate"]
    });
    static toggleOpenToWork = z.object({
        isOpenToWork: z.boolean()
    });
    static updateSalaryPreferences = z.object({
        expectedSalary: expectedSalaryValidator.optional(),
        currentSalary: currentSalaryValidator.optional(),
        noticePeriod: noticePeriodValidator.optional()
    });
    static updateLocationPreferences = z.object({
        preferredLocation: preferredLocationValidator.optional(),
        currentLocation: currentLocationValidator.optional()
    });
    static getPublicProfileParam = z.object({
        candidateId: candidateIdValidator
    });
}
//# sourceMappingURL=candidate.dto.js.map