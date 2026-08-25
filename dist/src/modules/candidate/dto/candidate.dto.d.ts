import z from "zod";
export declare class CandidateDto {
    static candidateIdParam: z.ZodObject<{
        candidateId: z.ZodString;
    }, z.z.core.$strip>;
    static updateCandidateProfile: z.ZodObject<{
        fullName: z.ZodOptional<z.ZodString>;
        phoneNumber: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>>;
        profilePicture: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>>>;
        headline: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>>>;
        bio: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>>>;
        dateOfBirth: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<Date, string>>>;
        gender: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
            MALE: "MALE";
            FEMALE: "FEMALE";
            OTHER: "OTHER";
            PREFER_NOT_TO_SAY: "PREFER_NOT_TO_SAY";
        }>>>;
        experienceLevel: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
            FRESHER: "FRESHER";
            INTERN: "INTERN";
            JUNIOR: "JUNIOR";
            MID_LEVEL: "MID_LEVEL";
            SENIOR: "SENIOR";
            LEAD: "LEAD";
            ARCHITECT: "ARCHITECT";
        }>>>;
        currentLocation: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>>>;
        preferredLocation: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>>>;
        currentCompany: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>>>;
        currentDesignation: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>>>;
        totalExperience: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        expectedSalary: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        currentSalary: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        noticePeriod: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        resumeUrl: z.ZodOptional<z.ZodString>;
        linkedinUrl: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>>>;
        githubUrl: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>>>;
        portfolioUrl: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>>>;
        websiteUrl: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>>>;
        isOpenToWork: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    }, z.z.core.$strip>;
    static resumeUpload: z.ZodObject<{
        resume: z.ZodString;
    }, z.z.core.$strip>;
    static deleteResumes: z.ZodObject<{
        resumeIds: z.ZodArray<z.ZodString>;
    }, z.z.core.$strip>;
    static singleSkill: z.ZodObject<{
        skillName: z.ZodString;
        skillExperience: z.ZodOptional<z.ZodNumber>;
    }, z.z.core.$strip>;
    static addSkills: z.ZodObject<{
        skills: z.ZodArray<z.ZodObject<{
            skillName: z.ZodString;
            skillExperience: z.ZodOptional<z.ZodNumber>;
        }, z.z.core.$strip>>;
    }, z.z.core.$strip>;
    static updateSkill: z.ZodObject<{
        skillName: z.ZodOptional<z.ZodString>;
        skillExperience: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    }, z.z.core.$strip>;
    static skillsIds: z.ZodObject<{
        skillIds: z.ZodArray<z.ZodString>;
    }, z.z.core.$strip>;
    static addEducation: z.ZodObject<{
        collegeName: z.ZodString;
        degree: z.ZodString;
        fieldOfStudy: z.ZodString;
        currentlyStudying: z.ZodDefault<z.ZodBoolean>;
        startDate: z.z.ZodCoercedDate<unknown>;
        endDate: z.ZodOptional<z.z.ZodCoercedDate<unknown>>;
        gradingSystem: z.ZodEnum<{
            OTHER: "OTHER";
            PERCENTAGE: "PERCENTAGE";
            CGPA: "CGPA";
            GPA_4: "GPA_4";
            GPA_5: "GPA_5";
            GPA_10: "GPA_10";
            LETTER_GRADE: "LETTER_GRADE";
            PASS_FAIL: "PASS_FAIL";
        }>;
        gradeText: z.ZodOptional<z.ZodString>;
        grade: z.ZodOptional<z.ZodNumber>;
    }, z.z.core.$strip>;
    static updateEducation: z.ZodObject<{
        collegeName: z.ZodOptional<z.ZodString>;
        degree: z.ZodOptional<z.ZodString>;
        fieldOfStudy: z.ZodOptional<z.ZodString>;
        currentlyStudying: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        startDate: z.ZodOptional<z.z.ZodCoercedDate<unknown>>;
        endDate: z.ZodOptional<z.ZodOptional<z.z.ZodCoercedDate<unknown>>>;
        gradingSystem: z.ZodOptional<z.ZodEnum<{
            OTHER: "OTHER";
            PERCENTAGE: "PERCENTAGE";
            CGPA: "CGPA";
            GPA_4: "GPA_4";
            GPA_5: "GPA_5";
            GPA_10: "GPA_10";
            LETTER_GRADE: "LETTER_GRADE";
            PASS_FAIL: "PASS_FAIL";
        }>>;
        gradeText: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        grade: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    }, z.z.core.$strip>;
    static addExperience: z.ZodObject<{
        companyName: z.ZodString;
        designation: z.ZodString;
        employmentType: z.ZodEnum<{
            FULL_TIME: "FULL_TIME";
            PART_TIME: "PART_TIME";
            CONTRACT: "CONTRACT";
            INTERN: "INTERN";
            FREELANCE: "FREELANCE";
            TEMPORARY: "TEMPORARY";
            APPRENTICESHIP: "APPRENTICESHIP";
        }>;
        description: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodString>;
        startDate: z.z.ZodCoercedDate<unknown>;
        endDate: z.ZodOptional<z.z.ZodCoercedDate<unknown>>;
        currentlyWorking: z.ZodDefault<z.ZodBoolean>;
    }, z.z.core.$strip>;
    static updateExperience: z.ZodObject<{
        companyName: z.ZodOptional<z.ZodString>;
        designation: z.ZodOptional<z.ZodString>;
        employmentType: z.ZodOptional<z.ZodEnum<{
            FULL_TIME: "FULL_TIME";
            PART_TIME: "PART_TIME";
            CONTRACT: "CONTRACT";
            INTERN: "INTERN";
            FREELANCE: "FREELANCE";
            TEMPORARY: "TEMPORARY";
            APPRENTICESHIP: "APPRENTICESHIP";
        }>>;
        description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        location: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        startDate: z.ZodOptional<z.z.ZodCoercedDate<unknown>>;
        endDate: z.ZodOptional<z.ZodOptional<z.z.ZodCoercedDate<unknown>>>;
        currentlyWorking: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    }, z.z.core.$strip>;
    static toggleOpenToWork: z.ZodObject<{
        isOpenToWork: z.ZodBoolean;
    }, z.z.core.$strip>;
    static updateSalaryPreferences: z.ZodObject<{
        expectedSalary: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        currentSalary: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        noticePeriod: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    }, z.z.core.$strip>;
    static updateLocationPreferences: z.ZodObject<{
        preferredLocation: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>>>;
        currentLocation: z.ZodOptional<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>>>;
    }, z.z.core.$strip>;
    static getPublicProfileParam: z.ZodObject<{
        candidateId: z.ZodString;
    }, z.z.core.$strip>;
}
export type CandidateIdParamDto = z.infer<typeof CandidateDto.candidateIdParam>;
export type UpdateCandidateProfileDto = z.infer<typeof CandidateDto.updateCandidateProfile>;
export type ResumeUploadDto = z.infer<typeof CandidateDto.resumeUpload>;
export type DeleteResumesDto = z.infer<typeof CandidateDto.deleteResumes>;
export type SingleSkillDto = z.infer<typeof CandidateDto.singleSkill>;
export type AddSkillsDto = z.infer<typeof CandidateDto.addSkills>;
export type UpdateSkillDto = z.infer<typeof CandidateDto.updateSkill>;
export type SkillsIdsDto = z.infer<typeof CandidateDto.skillsIds>;
export type AddEducationDto = z.infer<typeof CandidateDto.addEducation>;
export type UpdateEducationDto = z.infer<typeof CandidateDto.updateEducation>;
export type AddExperienceDto = z.infer<typeof CandidateDto.addExperience>;
export type UpdateExperienceDto = z.infer<typeof CandidateDto.updateExperience>;
export type ToggleOpenToWorkDto = z.infer<typeof CandidateDto.toggleOpenToWork>;
export type UpdateSalaryPreferencesDto = z.infer<typeof CandidateDto.updateSalaryPreferences>;
export type UpdateLocationPreferencesDto = z.infer<typeof CandidateDto.updateLocationPreferences>;
export type GetPublicProfileParamDto = z.infer<typeof CandidateDto.getPublicProfileParam>;
//# sourceMappingURL=candidate.dto.d.ts.map