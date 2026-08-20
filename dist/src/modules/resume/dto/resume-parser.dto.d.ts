import { z } from "zod";
export declare const personalInfoSchema: z.ZodObject<{
    fullName: z.ZodNullable<z.ZodString>;
    email: z.ZodNullable<z.ZodEmail>;
    phoneNumber: z.ZodNullable<z.ZodString>;
    currentLocation: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    linkedinUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    githubUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    portfolioUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    websiteUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const professionalInfoSchema: z.ZodObject<{
    headline: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    bio: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    currentCompany: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    currentDesignation: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    totalExperience: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
export declare const resumeSkillSchema: z.ZodObject<{
    name: z.ZodString;
    yearsOfExperience: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
export declare const resumeExperienceSchema: z.ZodObject<{
    companyName: z.ZodString;
    designation: z.ZodString;
    employmentType: z.ZodNullable<z.ZodEnum<{
        FULL_TIME: "FULL_TIME";
        PART_TIME: "PART_TIME";
        CONTRACT: "CONTRACT";
        INTERN: "INTERN";
        FREELANCE: "FREELANCE";
        TEMPORARY: "TEMPORARY";
        APPRENTICESHIP: "APPRENTICESHIP";
    }>>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    location: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    startDate: z.ZodNullable<z.ZodString>;
    endDate: z.ZodNullable<z.ZodString>;
    currentlyWorking: z.ZodBoolean;
}, z.core.$strip>;
export declare const resumeEducationSchema: z.ZodObject<{
    collegeName: z.ZodString;
    degree: z.ZodString;
    fieldOfStudy: z.ZodString;
    currentlyStudying: z.ZodBoolean;
    startDate: z.ZodNullable<z.ZodString>;
    endDate: z.ZodNullable<z.ZodString>;
    gradingSystem: z.ZodNullable<z.ZodEnum<{
        PERCENTAGE: "PERCENTAGE";
        CGPA: "CGPA";
        GPA_4: "GPA_4";
        GPA_5: "GPA_5";
        GPA_10: "GPA_10";
        LETTER_GRADE: "LETTER_GRADE";
        PASS_FAIL: "PASS_FAIL";
        OTHER: "OTHER";
    }>>;
    gradeText: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    grade: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
export declare const resumeProjectSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export declare const resumeCertificationSchema: z.ZodObject<{
    name: z.ZodString;
}, z.core.$strip>;
export declare const resumeParsingSchema: z.ZodObject<{
    personal: z.ZodObject<{
        fullName: z.ZodNullable<z.ZodString>;
        email: z.ZodNullable<z.ZodEmail>;
        phoneNumber: z.ZodNullable<z.ZodString>;
        currentLocation: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        linkedinUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        githubUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        portfolioUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        websiteUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>;
    professional: z.ZodObject<{
        headline: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        bio: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        currentCompany: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        currentDesignation: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        totalExperience: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    }, z.core.$strip>;
    skills: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        yearsOfExperience: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    }, z.core.$strip>>;
    experience: z.ZodArray<z.ZodObject<{
        companyName: z.ZodString;
        designation: z.ZodString;
        employmentType: z.ZodNullable<z.ZodEnum<{
            FULL_TIME: "FULL_TIME";
            PART_TIME: "PART_TIME";
            CONTRACT: "CONTRACT";
            INTERN: "INTERN";
            FREELANCE: "FREELANCE";
            TEMPORARY: "TEMPORARY";
            APPRENTICESHIP: "APPRENTICESHIP";
        }>>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        location: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        startDate: z.ZodNullable<z.ZodString>;
        endDate: z.ZodNullable<z.ZodString>;
        currentlyWorking: z.ZodBoolean;
    }, z.core.$strip>>;
    education: z.ZodArray<z.ZodObject<{
        collegeName: z.ZodString;
        degree: z.ZodString;
        fieldOfStudy: z.ZodString;
        currentlyStudying: z.ZodBoolean;
        startDate: z.ZodNullable<z.ZodString>;
        endDate: z.ZodNullable<z.ZodString>;
        gradingSystem: z.ZodNullable<z.ZodEnum<{
            PERCENTAGE: "PERCENTAGE";
            CGPA: "CGPA";
            GPA_4: "GPA_4";
            GPA_5: "GPA_5";
            GPA_10: "GPA_10";
            LETTER_GRADE: "LETTER_GRADE";
            PASS_FAIL: "PASS_FAIL";
            OTHER: "OTHER";
        }>>;
        gradeText: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        grade: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    }, z.core.$strip>>;
    projects: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>;
    certifications: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
//# sourceMappingURL=resume-parser.dto.d.ts.map