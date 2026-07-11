import { z } from "zod";

// user
export const emailValidator = z
    .email("Please enter a valid email address")
    .trim()
    .toLowerCase();

export const passwordValidator = z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(64, "Password must be at most 64 characters long")
    .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_+\-=[\]{};':"\\|,.<>/?]).+$/,
        "Password must contain uppercase, lowercase, number and special character."
    );

export const uuidValidator = z.string().cuid("Please enter a valid UUID");

export const otpValidator = z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only digits");

export const resetPasswordTokenValidator = z
    .string()
    .min(1, "Reset password token is required")
    .trim();


// Candidate
export const candidateFullNameValidator = z
  .string()
  .trim()
  .min(1, "Full name is required")
  .max(50, "Full name must be at most 50 characters long");

export const phoneNumberValidator = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number")
  .min(7, "Phone number must be at least 7 digits long")
  .max(15, "Phone number must be at most 15 digits long");

export const profilePictureValidator = z
  .string()
  .trim()
  .url("Please enter a valid profile picture URL")
  .optional();

export const headlineValidator = z
  .string()
  .trim()
  .min(3, "Headline must be at least 3 characters long")
  .max(120, "Headline must be at most 120 characters long")
  .optional();

export const bioValidator = z
  .string()
  .trim()
  .max(1000, "Bio must be at most 1000 characters long")
  .optional();

export const genderValidator = z.enum([
  "MALE",
  "FEMALE",
  "OTHER",
  "PREFER_NOT_TO_SAY",
]).optional();

export const experienceLevelValidator = z.enum([
  "FRESHER",
  "INTERN",
  "JUNIOR",
  "MID_LEVEL",
  "SENIOR",
  "LEAD",
  "ARCHITECT",
]).optional();

export const currentLocationValidator = z
  .string()
  .trim()
  .min(2, "Current location is too short")
  .max(100, "Current location must be at most 100 characters long")
  .optional();

export const preferredLocationValidator = z
  .string()
  .trim()
  .min(2, "Preferred location is too short")
  .max(100, "Preferred location must be at most 100 characters long")
  .optional();

export const currentCompanyValidator = z
  .string()
  .trim()
  .min(2, "Current company name is too short")
  .max(100, "Current company name must be at most 100 characters long")
  .optional();

export const currentDesignationValidator = z
  .string()
  .trim()
  .min(2, "Current designation is too short")
  .max(100, "Current designation must be at most 100 characters long")
  .optional();

export const totalExperienceValidator = z
  .number()
  .min(0, "Total experience cannot be negative")
  .max(50, "Total experience cannot exceed 50 years")
  .optional();

export const expectedSalaryValidator = z
  .number()
  .int("Expected salary must be a whole number")
  .min(0, "Expected salary cannot be negative")
  .optional();

export const currentSalaryValidator = z
  .number()
  .int("Current salary must be a whole number")
  .min(0, "Current salary cannot be negative")
  .optional();

export const noticePeriodValidator = z
  .number()
  .int("Notice period must be a whole number")
  .min(0, "Notice period cannot be negative")
  .max(365, "Notice period cannot exceed 365 days")
  .optional();

export const linkedInUrlValidator = z
  .string()
  .trim()
  .url("Please enter a valid LinkedIn URL")
  .optional();

export const githubUrlValidator = z
  .string()
  .trim()
  .url("Please enter a valid GitHub URL")
  .optional();

export const portfolioUrlValidator = z
  .string()
  .trim()
  .url("Please enter a valid portfolio URL")
  .optional();

export const websiteUrlValidator = z
  .string()
  .trim()
  .url("Please enter a valid website URL")
  .optional();

export const isOpenToWorkValidator = z
  .boolean()
  .optional();

// employer 
export const employerFullNameValidator = candidateFullNameValidator;
export const employerPhoneNumberValidator = phoneNumberValidator;
export const designationValidator = z
  .string()
  .trim()
  .min(2, "Designation must be at least 2 characters long")
  .max(100, "Designation must be at most 100 characters long")
  .optional();

export const departmentValidator = z
  .string()
  .trim()
  .min(2, "Department must be at least 2 characters long")
  .max(100, "Department must be at most 100 characters long")
  .optional();

export const employerProfilePictureValidator = profilePictureValidator;
export const employerLinkedInUrlValidator = linkedInUrlValidator;

// company 
export const companyNameValidator = z
  .string()
  .trim()
  .min(2, "Company name must be at least 2 characters long")
  .max(100, "Company name must be at most 100 characters long");

export const companyEmailValidator = emailValidator;

export const companyPhoneNumberValidator = phoneNumberValidator;

export const companyWebsiteValidator = z
  .string()
  .trim()
  .url("Please enter a valid website URL")
  .optional();

export const companyLogoValidator = z
  .string()
  .trim()
  .url("Please enter a valid logo URL")
  .optional();

export const companyCoverImageValidator = z
  .string()
  .trim()
  .url("Please enter a valid cover image URL")
  .optional();

export const companyDescriptionValidator = z
  .string()
  .trim()
  .max(2000, "Description must be at most 2000 characters long")
  .optional();

export const companyIndustryValidator = z
  .string()
  .trim()
  .min(2, "Industry must be at least 2 characters long")
  .max(100, "Industry must be at most 100 characters long")
  .optional();

export const companySizeValidator = z
  .string()
  .trim()
  .min(2, "Company size is required")
  .max(50, "Company size must be at most 50 characters long")
  .optional();

export const foundedYearValidator = z
  .number()
  .int("Founded year must be a whole number")
  .min(1800, "Founded year is invalid")
  .max(new Date().getFullYear(), "Founded year cannot be in the future")
  .optional();

export const headquartersValidator = z
  .string()
  .trim()
  .min(2, "Headquarters is too short")
  .max(150, "Headquarters must be at most 150 characters long")
  .optional();

export const companyLinkedInUrlValidator = linkedInUrlValidator;

export const twitterUrlValidator = z
  .string()
  .trim()
  .url("Please enter a valid Twitter/X URL")
  .optional();

export const companyVisibilityValidator = z
  .enum(["PUBLIC", "PRIVATE"])
  .optional();


// Job

export const companyIdValidator = uuidValidator;

export const jobTitleValidator = z
  .string()
  .trim()
  .min(3, "Job title must be at least 3 characters long")
  .max(100, "Job title must be at most 100 characters long");

export const jobDescriptionValidator = z
  .string()
  .trim()
  .min(20, "Job description must be at least 20 characters long")
  .max(10000, "Job description must be at most 10000 characters long");

export const jobTypeValidator = z
  .enum([
    "FULL_TIME",
    "PART_TIME",
    "INTERN",
    "CONTRACT",
    "FREELANCE",
    "TEMPORARY",
    "APPRENTICESHIP",
  ])
  .optional();

export const minimumExperienceValidator = z
  .number()
  .min(0, "Minimum experience cannot be negative")
  .max(50, "Minimum experience cannot exceed 50 years")
  .optional();

export const maximumExperienceValidator = z
  .number()
  .min(0, "Maximum experience cannot be negative")
  .max(50, "Maximum experience cannot exceed 50 years")
  .optional();

export const minimumSalaryValidator = z
  .number()
  .int("Minimum salary must be a whole number")
  .min(0, "Minimum salary cannot be negative")
  .optional();

export const maximumSalaryValidator = z
  .number()
  .int("Maximum salary must be a whole number")
  .min(0, "Maximum salary cannot be negative")
  .optional();


// Resume

export const candidateIdValidator = uuidValidator;
export const resumeFileValidator = z
  .string()
  .trim()
  .url("Please provide a valid resume file URL");

export const resumeTitleValidator = z
  .string()
  .trim()
  .min(2, "Resume title must be at least 2 characters long")
  .max(100, "Resume title must be at most 100 characters long");


// Application

export const jobIdValidator = uuidValidator;
export const resumeIdValidator = uuidValidator;
export const coverLetterValidator = z
  .string()
  .trim()
  .max(3000, "Cover letter must be at most 3000 characters long")
  .optional();


// Candidate Skill

export const skillNameValidator = z
  .string()
  .trim()
  .min(2, "Skill name must be at least 2 characters long")
  .max(50, "Skill name must be at most 50 characters long");

export const skillExperienceValidator = z
  .number()
  .min(0, "Experience cannot be negative")
  .max(50, "Experience cannot exceed 50 years")
  .optional();

export const proficiencyValidator = z
  .number()
  .int("Proficiency must be a whole number")
  .min(1, "Proficiency must be at least 1")
  .max(5, "Proficiency must not exceed 5");


// Candidate Education

export const collegeValidator = z
  .string()
  .trim()
  .min(2, "College name must be at least 2 characters long")
  .max(150, "College name must be at most 150 characters long");

export const degreeValidator = z
  .string()
  .trim()
  .min(2, "Degree must be at least 2 characters long")
  .max(100, "Degree must be at most 100 characters long");

export const fieldOfStudyValidator = z
  .string()
  .trim()
  .min(2, "Field of study must be at least 2 characters long")
  .max(100, "Field of study must be at most 100 characters long");

export const startDateValidator = z.coerce.date();

export const endDateValidator = z.coerce.date().optional();

export const cgpaValidator = z
  .number()
  .min(0, "CGPA cannot be negative")
  .max(10, "CGPA cannot exceed 10")
  .optional();

export const percentageValidator = z
  .number()
  .min(0, "Percentage cannot be negative")
  .max(100, "Percentage cannot exceed 100")
  .optional();


// Candidate Experience

export const experienceDesignationValidator = z
  .string()
  .trim()
  .min(2, "Designation must be at least 2 characters long")
  .max(100, "Designation must be at most 100 characters long");

export const employmentTypeValidator = z
  .string()
  .trim()
  .min(2, "Employment type is required")
  .max(50, "Employment type must be at most 50 characters long");

export const experienceStartDateValidator = z.coerce.date();

export const experienceEndDateValidator = z.coerce.date().optional();

export const isCurrentJobValidator = z.boolean();

export const experienceDescriptionValidator = z
  .string()
  .trim()
  .max(3000, "Description must be at most 3000 characters long")
  .optional();


// Refresh Token

export const refreshTokenValidator = z
  .string()
  .trim()
  .min(1, "Refresh token is required");
