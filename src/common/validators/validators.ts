import { z } from "zod";
import {
  Gender,
  ExperienceLevel,
  CompanyVisibility,
  EmploymentType,
  SalaryPeriod,
  WorkplaceType,
  JobStatus,
  JobVisibility,
  WorkflowStatus,
  StageType,
  UserRole,
  CompanyMemberRole,
  CompanyMemberStatus,
  CompanyStatus,
  AccountStatus,
  GradingSystem,
  ApplicationStatus,
  QuestionType,
  QuestionStatus,
  QuestionDifficulty,
  QuestionOwnership,
  TestCaseType,
  AttemptStatus,
  EvaluationStatus,
  ReviewStatus,
  AssessmentStatus,
  InterviewType,
  InterviewMode,
  InterviewStatus,
  InterviewSessionStatus,
  InterviewAssignmentCreationSource,
  InterviewParticipantType,
  AIRecommendation
} from "@prisma/client";

// General / User
export const uuidValidator = z.string().cuid("Please enter a valid UUID");

export const userIdValidator = uuidValidator;

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

export const otpValidator = z
  .string()
  .length(6, "OTP must be 6 digits")
  .regex(/^\d+$/, "OTP must contain only digits");

export const resetPasswordTokenValidator = z
  .string()
  .min(1, "Reset password token is required")
  .trim();

export const otpExpiresAtValidator = z.coerce.date().optional();
export const resetPasswordTokenExpiresAtValidator = z.coerce.date().optional();
export const userRoleValidator = z.nativeEnum(UserRole);
export const accountStatusValidator = z.nativeEnum(AccountStatus);
export const isEmailVerifiedValidator = z.boolean();
export const lastLoginAtValidator = z.coerce.date().optional();
export const deletedAtValidator = z.coerce.date().optional();
export const deletedByIdValidator = uuidValidator.optional();
export const suspendedAtValidator = z.coerce.date().optional();
export const suspendedByIdValidator = uuidValidator.optional();
export const suspendedReasonValidator = z.string().trim().max(1000).optional();
export const restoredAtValidator = z.coerce.date().optional();
export const restoredByIdValidator = uuidValidator.optional();

// Refresh Token
export const refreshTokenValidator = z
  .string()
  .trim()
  .min(1, "Refresh token is required");
export const refreshTokenExpiresAtValidator = z.coerce.date();
export const refreshTokenRevokedAtValidator = z.coerce.date().optional();

// Candidate
export const candidateFullNameValidator = z
  .string()
  .trim()
  .min(1, "Full name is required")
  .max(50, "Full name must be at most 50 characters long");

export const phoneNumberValidator = z
  .string()
  .trim()
  .refine(
    (val) => {
      if (!val || val === "") return true;
      // Allow formats like: +1 555-000-0000, +91 9876543210, (555) 000-0000, 6261970047
      const digitsOnly = val.replace(/\D/g, "");
      return digitsOnly.length >= 7 && digitsOnly.length <= 15;
    },
    { message: "Please enter a valid phone number (7 to 15 digits)" }
  )
  .transform((val) => (val === "" ? undefined : val));

export const profilePictureValidator = z
  .string()
  .trim()
  .refine(
    (val) => !val || val === "" || /^https?:\/\/.+/.test(val),
    { message: "Please enter a valid profile picture URL" }
  )
  .transform((val) => (val === "" ? undefined : val))
  .optional();

export const headlineValidator = z
  .string()
  .trim()
  .refine(
    (val) => !val || val === "" || val.length >= 2,
    { message: "Headline must be at least 2 characters long" }
  )
  .transform((val) => (val === "" ? undefined : val))
  .optional();

export const bioValidator = z
  .string()
  .trim()
  .max(1000, "Bio must be at most 1000 characters long")
  .transform((val) => (val === "" ? undefined : val))
  .optional();

export const dateOfBirthValidator = z
  .string()
  .transform((value) => new Date(value))
  .refine((date) => !isNaN(date.getTime()), {
    message: "Invalid date format",
  })
  .refine((date) => date < new Date(), {
    message: "Date of birth cannot be in the future",
  });

export const genderValidator = z.nativeEnum(Gender).optional();

export const experienceLevelValidator = z.nativeEnum(ExperienceLevel).optional();

export const currentLocationValidator = z
  .string()
  .trim()
  .transform((val) => (val === "" ? undefined : val))
  .optional();

export const preferredLocationValidator = z
  .string()
  .trim()
  .transform((val) => (val === "" ? undefined : val))
  .optional();

export const currentCompanyValidator = z
  .string()
  .trim()
  .transform((val) => (val === "" ? undefined : val))
  .optional();

export const currentDesignationValidator = z
  .string()
  .trim()
  .transform((val) => (val === "" ? undefined : val))
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
  .refine(
    (val) => !val || val === "" || /^https?:\/\/.+/.test(val),
    { message: "Please enter a valid LinkedIn URL" }
  )
  .transform((val) => (val === "" ? undefined : val))
  .optional();

export const githubUrlValidator = z
  .string()
  .trim()
  .refine(
    (val) => !val || val === "" || /^https?:\/\/.+/.test(val),
    { message: "Please enter a valid GitHub URL" }
  )
  .transform((val) => (val === "" ? undefined : val))
  .optional();

export const portfolioUrlValidator = z
  .string()
  .trim()
  .refine(
    (val) => !val || val === "" || /^https?:\/\/.+/.test(val),
    { message: "Please enter a valid portfolio URL" }
  )
  .transform((val) => (val === "" ? undefined : val))
  .optional();

export const websiteUrlValidator = z
  .string()
  .trim()
  .refine(
    (val) => !val || val === "" || /^https?:\/\/.+/.test(val),
    { message: "Please enter a valid website URL" }
  )
  .transform((val) => (val === "" ? undefined : val))
  .optional();

export const isOpenToWorkValidator = z
  .boolean()
  .optional();

export const profileCompletionValidator = z
  .number()
  .int()
  .min(0)
  .max(100);

// Employer
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
export const employerIsActiveValidator = z.boolean();

// Company
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

export const companyInvitationToken = z
  .string()
  .trim()
  .min(1, "Invitation token is required.");

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

export const companyVisibilityValidator = z.nativeEnum(CompanyVisibility).optional();
export const companySlugValidator = z
  .string()
  .trim()
  .min(2, "Company slug must be at least 2 characters long")
  .max(100, "Company slug must be at most 100 characters long");
export const companyStatusValidator = z.nativeEnum(CompanyStatus);
export const companyProfileCompletionValidator = z.number().int().min(0).max(100);
export const companyIsVerifiedValidator = z.boolean();
export const companyVerifiedAtValidator = z.coerce.date().optional();
export const companyVerifiedByValidator = uuidValidator.optional();
export const companyDeletedAtValidator = z.coerce.date().optional();
export const companyDeletedByValidator = uuidValidator.optional();
export const companySuspendedAtValidator = z.coerce.date().optional();
export const companySuspendedByValidator = uuidValidator.optional();
export const companySuspendedReasonValidator = z.string().trim().max(1000).optional();
export const companyRestoredAtValidator = z.coerce.date().optional();
export const companyRestoredByValidator = uuidValidator.optional();

// Company Member
export const companyMemberIdValidator = uuidValidator;
export const companyMemberRoleValidator = z.nativeEnum(CompanyMemberRole);
export const companyMemberJoinedAtValidator = z.coerce.date();
export const companyMemberStatusValidator = z.nativeEnum(CompanyMemberStatus);
export const companyMemberInvitationTokenValidator = z.string().trim().optional();
export const companyMemberInvitedAtValidator = z.coerce.date().optional();
export const companyMemberExpiresAtValidator = z.coerce.date().optional();
export const companyMemberInvitedByValidator = uuidValidator.optional();

// Admin
export const adminIdValidator = uuidValidator;
export const adminFullNameValidator = z
  .string()
  .trim()
  .min(1, "Full name is required")
  .max(50, "Full name must be at most 50 characters long");
export const adminPhoneNumberValidator = phoneNumberValidator.optional();
export const adminProfilePictureValidator = profilePictureValidator;
export const adminDesignationValidator = z
  .string()
  .trim()
  .min(2)
  .max(100)
  .optional();
export const adminDepartmentValidator = z
  .string()
  .trim()
  .min(2)
  .max(100)
  .optional();
export const adminEmployeeIdValidator = z
  .string()
  .trim()
  .min(1, "Employee ID is required")
  .max(50, "Employee ID must be at most 50 characters long");
export const adminIsSuperAdminValidator = z.boolean();
export const adminIsActiveValidator = z.boolean();
export const adminLastActiveAtValidator = z.coerce.date().optional();

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

export const employmentTypeValidator = z.nativeEnum(EmploymentType);

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

export const salaryPeriodValidator = z.nativeEnum(SalaryPeriod).optional();

export const workplaceTypeValidator = z.nativeEnum(WorkplaceType);

export const jobStatusValidator = z.nativeEnum(JobStatus);

export const jobVisibilityValidator = z.nativeEnum(JobVisibility);

export const jobVacanciesValidator = z
  .number()
  .int("Job vacancies must be a whole number")
  .positive("Job vacancies must be a positive number")
  .optional();

export const locationValidator = z
  .string()
  .trim()
  .min(2, "Location must be at least 2 characters long")
  .max(100, "Location must be at most 100 characters long")
  .optional();

export const hideSalaryValidator = z.boolean().optional();

export const applicationDeadlineValidator = z.coerce.date().optional();

export const skillsValidator = z.array(
  z.string()
    .trim()
    .min(2, "Skill must be at least 2 characters long")
    .max(50, "Skill must be at most 50 characters long")
).min(1, "At least one skill is required");

export const benefitsValidator = z.array(
  z.string()
    .trim()
    .min(2, "Benefit must be at least 2 characters long")
    .max(100, "Benefit must be at most 100 characters long")
).optional();

export const jobSlugValidator = z
  .string()
  .trim()
  .min(2, "Job slug must be at least 2 characters long")
  .max(150, "Job slug must be at most 150 characters long");
export const jobSummaryValidator = z.string().trim().max(500).optional();
export const jobPublishedAtValidator = z.coerce.date().optional();
export const jobClosedAtValidator = z.coerce.date().optional();
export const jobArchivedAtValidator = z.coerce.date().optional();
export const jobCreatedByIdValidator = uuidValidator;
export const jobUpdatedByIdValidator = uuidValidator.optional();

// Job Skill
export const jobSkillNameValidator = z
  .string()
  .trim()
  .min(1, "Skill name is required")
  .max(100, "Skill name must be at most 100 characters long");
export const jobSkillIsRequiredValidator = z.boolean();

// Job Benefit
export const jobBenefitValidator = z
  .string()
  .trim()
  .min(1, "Benefit cannot be empty")
  .max(200, "Benefit must be at most 200 characters long");

// Job Member
export const jobMemberAssignedAtValidator = z.coerce.date();
export const jobMemberAssignedByValidator = uuidValidator.optional();

// Application
export const applicationIdValidator = uuidValidator;
export const jobIdValidator = uuidValidator;
export const coverLetterValidator = z
  .string()
  .trim()
  .max(3000, "Cover letter must be at most 3000 characters long")
  .optional();

export const applicationStatusValidator = z.nativeEnum(ApplicationStatus);
export const appliedAtValidator = z.coerce.date();
export const lastStatusUpdatedAtValidator = z.coerce.date().optional();
export const applicationWithdrawnAtValidator = z.coerce.date().optional();
export const applicationWithdrawReasonValidator = z
  .string()
  .trim()
  .max(1000, "Withdraw reason must be at most 1000 characters long")
  .optional();
export const applicationRejectedAtValidator = z.coerce.date().optional();
export const applicationRejectionReasonValidator = z
  .string()
  .trim()
  .max(1000, "Rejection reason must be at most 1000 characters long")
  .optional();
export const applicationHiredAtValidator = z.coerce.date().optional();

// Resume
export const resumeIdValidator = uuidValidator;
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

export const resumeNameValidator = z
  .string()
  .trim()
  .min(1, "Resume file name is required")
  .max(255, "Resume file name must be at most 255 characters long");
export const resumeFileSizeValidator = z
  .number()
  .int("File size must be an integer")
  .positive("File size must be positive");
export const resumeUploadedAtValidator = z.coerce.date();
export const resumeDeletedAtValidator = z.coerce.date().optional();

// Candidate Skill
export const skillNameValidator = z
  .string()
  .trim()
  .min(1, "Skill name must be at least 1 characters long")
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

export const currentlyStudyingValidator = z.boolean();
export const gradingSystemValidator = z.nativeEnum(GradingSystem);
export const gradeTextValidator = z
  .string()
  .trim()
  .max(50, "Grade text must be at most 50 characters long")
  .optional();
export const gradeValidator = z
  .number()
  .min(0, "Grade cannot be negative")
  .max(100, "Grade cannot exceed 100")
  .optional();

// Candidate Experience
export const experienceDesignationValidator = z
  .string()
  .trim()
  .min(2, "Designation must be at least 2 characters long")
  .max(100, "Designation must be at most 100 characters long");

export const experienceEmploymentTypeValidator = z
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

export const experienceLocationValidator = z
  .string()
  .trim()
  .max(150, "Location must be at most 150 characters long")
  .optional();
export const currentlyWorkingValidator = z.boolean();


// Hiring Workflow / Workflow
export const workflowIdValidator = uuidValidator;
export const workflowNameValidator = z
  .string()
  .trim()
  .min(2, "Workflow name must be at least 2 characters long")
  .max(100, "Workflow name must be at most 100 characters long");
export const workflowDescriptionValidator = z
  .string()
  .trim()
  .max(500, "Workflow description must be at most 500 characters long")
  .optional();
export const workflowStatusValidator = z.nativeEnum(WorkflowStatus);
export const workflowIsDefaultValidator = z.boolean();

// Stage Library
export const stageLibraryIdValidator = uuidValidator;
export const stageNameValidator = z
  .string()
  .trim()
  .min(2, "Stage name must be at least 2 characters long")
  .max(100, "Stage name must be at most 100 characters long");
export const stageDescriptionValidator = z
  .string()
  .trim()
  .max(500, "Stage description must be at most 500 characters long")
  .optional();
export const stageTypeValidator = z.nativeEnum(StageType);
export const stageIsActiveValidator = z.boolean();

// Workflow Stage
export const workflowStageIdValidator = uuidValidator;
export const stageOrderValidator = z
  .number()
  .int("Stage order must be an integer")
  .nonnegative("Stage order cannot be negative");
export const stageIsEnabledValidator = z.boolean();
export const stageIsFinalValidator = z.boolean();

// Application Workflow
export const applicationWorkflowIdValidator = uuidValidator;
export const remarksValidator = z
  .string()
  .trim()
  .max(1000, "Remarks must be at most 1000 characters long")
  .optional();
export const assignedEmployerIdValidator = uuidValidator.optional();
export const applicationWorkflowMovedAtValidator = z.coerce.date();

// Workflow History
export const workflowHistoryIdValidator = uuidValidator;
export const commentValidator = z
  .string()
  .trim()
  .max(1000, "Comment must be at most 1000 characters long")
  .optional();
export const workflowHistoryMovedByEmployerIdValidator = uuidValidator.optional();

// Question Category
export const questionCategoryIdValidator = uuidValidator;
export const questionCategoryNameValidator = z
  .string()
  .trim()
  .min(1, "Category name is required")
  .max(100, "Category name must be at most 100 characters long");
export const questionCategoryDisplayOrderValidator = z
  .number()
  .int("Display order must be an integer")
  .nonnegative("Display order cannot be negative");
export const questionCategoryParentIdValidator = uuidValidator.optional();

// Question Tag
export const questionTagIdValidator = uuidValidator;
export const questionTagNameValidator = z
  .string()
  .trim()
  .min(1, "Tag name is required")
  .max(50, "Tag name must be at most 50 characters long");

// Question
export const questionIdValidator = uuidValidator;
export const questionTitleValidator = z
  .string()
  .trim()
  .min(3, "Title must be at least 3 characters long")
  .max(150, "Title must be at most 150 characters long");
export const questionDescriptionValidator = z
  .string()
  .trim()
  .min(5, "Description must be at least 5 characters long");
export const questionTypeValidator = z.nativeEnum(QuestionType);
export const questionDifficultyValidator = z.nativeEnum(QuestionDifficulty);
export const questionEstimatedTimeValidator = z
  .number()
  .int("Estimated time must be an integer")
  .positive("Estimated time must be positive");
export const questionDefaultMarksValidator = z
  .number()
  .positive("Default marks must be positive");
export const questionOwnershipValidator = z.nativeEnum(QuestionOwnership);
export const questionStatusValidator = z.nativeEnum(QuestionStatus);
export const questionCodeValidator = z.string().trim().optional();
export const questionCompanyIdValidator = uuidValidator.optional();
export const questionCreatedByCompanyMemberIdValidator = uuidValidator.optional();
export const questionCreatedByIdValidator = uuidValidator.optional();
export const questionUpdatedByIdValidator = uuidValidator.optional();
export const questionPublishedByIdValidator = uuidValidator.optional();
export const questionArchivedByIdValidator = uuidValidator.optional();
export const questionDeletedAtValidator = z.coerce.date().optional();
export const questionDeletedByIdValidator = uuidValidator.optional();
export const questionPublishedAtValidator = z.coerce.date().optional();
export const questionArchivedAtValidator = z.coerce.date().optional();
export const questionVersionValidator = z
  .number()
  .int("Version must be an integer")
  .positive("Version must be positive");
export const questionUsageCountValidator = z
  .number()
  .int("Usage count must be an integer")
  .nonnegative("Usage count cannot be negative");
export const questionSuccessRateValidator = z
  .number()
  .min(0, "Success rate cannot be less than 0%")
  .max(100, "Success rate cannot exceed 100%")
  .optional();

// MCQ Detail
export const mcqDetailIdValidator = uuidValidator;
export const mcqDetailQuestionIdValidator = uuidValidator;
export const allowMultipleCorrectAnswersValidator = z.boolean();
export const negativeMarksValidator = z
  .number()
  .nonnegative("Negative marks cannot be negative");

// MCQ Option
export const mcqOptionIdValidator = uuidValidator;
export const mcqOptionTextValidator = z
  .string()
  .trim()
  .min(1, "Option text cannot be empty")
  .max(1000, "Option text must be at most 1000 characters long");
export const mcqOptionDisplayOrderValidator = z
  .number()
  .int("Display order must be an integer")
  .nonnegative("Display order cannot be negative");
export const mcqOptionIsCorrectValidator = z.boolean();

// DSA Detail
export const dsaDetailIdValidator = uuidValidator;
export const dsaDetailQuestionIdValidator = uuidValidator;
export const dsaStarterCodeValidator = z.string();
export const dsaReferenceSolutionValidator = z.string().optional().nullable();
export const dsaMemoryLimitValidator = z
  .number()
  .int("Memory limit must be an integer")
  .positive("Memory limit must be positive");
export const dsaTimeLimitValidator = z
  .number()
  .int("Time limit must be an integer")
  .positive("Time limit must be positive");

// Programming Language
export const programmingLanguageIdValidator = uuidValidator;
export const programmingLanguageNameValidator = z
  .string()
  .trim()
  .min(1, "Language name is required")
  .max(50, "Language name must be at most 50 characters long");
export const programmingLanguageSlugValidator = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .max(50, "Slug must be at most 50 characters long");
export const programmingLanguageIsActiveValidator = z.boolean();

// TestCase
export const testCaseIdValidator = uuidValidator;
export const testCaseInputValidator = z.string();
export const testCaseExpectedOutputValidator = z.string();
export const testCaseTypeValidator = z.nativeEnum(TestCaseType);
export const testCaseExplanationValidator = z
  .string()
  .trim()
  .max(1000, "Explanation must be at most 1000 characters long")
  .optional();
export const testCaseDisplayOrderValidator = z
  .number()
  .int("Display order must be an integer")
  .nonnegative("Display order cannot be negative");

// Machine Coding Detail
export const machineCodingDetailIdValidator = uuidValidator;
export const repositoryTemplateValidator = z
  .string()
  .trim()
  .url("Please provide a valid template repository URL")
  .optional();
export const projectStructureValidator = z.string().trim().optional();
export const techStackValidator = z.string().trim().optional();
export const implementationInstructionsValidator = z
  .string()
  .trim()
  .min(10, "Instructions must be at least 10 characters long");
export const evaluationGuidelinesValidator = z.string().trim().optional();

// Project Detail
export const projectDetailIdValidator = uuidValidator;
export const projectRequirementsValidator = z
  .string()
  .trim()
  .min(10, "Requirements must be at least 10 characters long");
export const projectSubmissionInstructionsValidator = z
  .string()
  .trim()
  .min(10, "Submission instructions must be at least 10 characters long");
export const projectDeadlineHoursValidator = z
  .number()
  .int("Deadline hours must be an integer")
  .positive("Deadline hours must be positive");

// Assessment
export const assessmentIdValidator = uuidValidator;
export const assessmentCompanyIdValidator = uuidValidator;
export const assessmentTitleValidator = z
  .string()
  .trim()
  .min(3, "Title must be at least 3 characters long")
  .max(150, "Title must be at most 150 characters long");
export const assessmentDescriptionValidator = z
  .string()
  .trim()
  .max(1000, "Description must be at most 1000 characters long")
  .optional();
export const assessmentInstructionsValidator = z
  .string()
  .trim()
  .max(2000, "Instructions must be at most 2000 characters long")
  .optional();
export const assessmentDurationMinutesValidator = z
  .number()
  .int("Duration must be an integer")
  .positive("Duration must be positive")
  .optional();
export const assessmentPassingScoreValidator = z
  .number()
  .positive("Passing score must be positive")
  .optional();
export const assessmentStatusValidator = z.nativeEnum(AssessmentStatus);
export const assessmentTotalMarksValidator = z
  .number()
  .positive("Total marks must be positive")
  .optional();
export const assessmentIsTemplateValidator = z.boolean();
export const assessmentCreatedByIdValidator = uuidValidator;
export const assessmentUpdatedByIdValidator = uuidValidator.optional();
export const assessmentArchivedByIdValidator = uuidValidator.optional();
export const assessmentDeletedByIdValidator = uuidValidator.optional();
export const assessmentDeletedAtValidator = z.coerce.date().optional();
export const assessmentPublishedAtValidator = z.coerce.date().optional();
export const assessmentArchivedAtValidator = z.coerce.date().optional();

// Assessment Section
export const assessmentSectionIdValidator = uuidValidator;
export const assessmentSectionTitleValidator = z
  .string()
  .trim()
  .min(1, "Section title is required")
  .max(150, "Section title must be at most 150 characters long");
export const assessmentSectionDescriptionValidator = z
  .string()
  .trim()
  .max(1000, "Section description must be at most 1000 characters long")
  .optional();
export const assessmentSectionInstructionsValidator = z
  .string()
  .trim()
  .max(2000, "Section instructions must be at most 2000 characters long")
  .optional();
export const assessmentSectionDurationMinutesValidator = z
  .number()
  .int("Duration must be an integer")
  .positive("Duration must be positive")
  .optional();
export const assessmentSectionDisplayOrderValidator = z
  .number()
  .int("Display order must be an integer")
  .nonnegative("Display order cannot be negative");
export const assessmentSectionTypeValidator = z.nativeEnum(QuestionType);

// Assessment Section Item
export const assessmentSectionItemIdValidator = uuidValidator;
export const marksOverrideValidator = z
  .number()
  .positive("Marks override must be positive")
  .optional();
export const negativeMarksOverrideValidator = z
  .number()
  .nonnegative("Negative marks override cannot be negative")
  .optional();
export const timeLimitOverrideValidator = z
  .number()
  .int("Time limit override must be an integer")
  .positive("Time limit override must be positive")
  .optional();
export const assessmentSectionItemIsRequiredValidator = z.boolean();

// Assessment Attempt
export const assessmentAttemptIdValidator = uuidValidator;
export const assessmentAttemptStatusValidator = z.nativeEnum(AttemptStatus);
export const assessmentAttemptStartedAtValidator = z.coerce.date().optional();
export const assessmentAttemptSubmittedAtValidator = z.coerce.date().optional();
export const assessmentAttemptLastActivityAtValidator = z.coerce.date().optional();
export const attemptNumberValidator = z
  .number()
  .int("Attempt number must be an integer")
  .positive("Attempt number must be positive");
export const timeTakenInSecondsValidator = z
  .number()
  .int("Time taken must be an integer")
  .nonnegative("Time taken cannot be negative")
  .optional();
export const completedDurationSecondsValidator = z
  .number()
  .int("Completed duration must be an integer")
  .nonnegative("Completed duration cannot be negative")
  .optional();
export const overallScoreValidator = z
  .number()
  .nonnegative("Overall score cannot be negative")
  .optional();
export const assessmentAttemptPercentageValidator = z
  .number()
  .min(0, "Percentage cannot be less than 0%")
  .max(100, "Percentage cannot exceed 100%")
  .optional();
export const assessmentAttemptPassedValidator = z.boolean().optional();
export const evaluationStatusValidator = z.nativeEnum(EvaluationStatus);
export const reviewStatusValidator = z.nativeEnum(ReviewStatus);

// Assessment Answer
export const assessmentAnswerIdValidator = uuidValidator;
export const assessmentAnswerStartedAtValidator = z.coerce.date().optional();
export const assessmentAnswerSubmittedAtValidator = z.coerce.date().optional();
export const assessmentAnswerScoreValidator = z
  .number()
  .nonnegative("Score cannot be negative")
  .optional();
export const assessmentAnswerIsCorrectValidator = z.boolean().optional();
export const assessmentAnswerFeedbackValidator = z
  .string()
  .trim()
  .max(1000, "Feedback must be at most 1000 characters long")
  .optional();
export const selectedOptionIdsValidator = z.array(uuidValidator);
export const attachmentUrlsValidator = z.array(z.string().url("Please enter valid attachment URLs"));
export const codeResponseValidator = z.union([
  z.string(),
  z.object({
    code: z.string(),
    language: z.string().optional()
  })
]).optional();
export const submissionUrlValidator = z.string().url("Please enter a valid submission URL").optional();
export const metaValidator = z.any().optional();

// Interviews
export const interviewIdValidator = uuidValidator;
export const interviewTitleValidator = z
  .string()
  .trim()
  .min(3, "Title must be at least 3 characters long")
  .max(150, "Title must be at most 150 characters long");
export const interviewDescriptionValidator = z
  .string()
  .trim()
  .max(1000, "Description must be at most 1000 characters long")
  .optional();
export const interviewInstructionsValidator = z
  .string()
  .trim()
  .max(2000, "Instructions must be at most 2000 characters long")
  .optional();
export const interviewTypeValidator = z.nativeEnum(InterviewType);
export const interviewModeValidator = z.nativeEnum(InterviewMode);
export const interviewStatusValidator = z.nativeEnum(InterviewStatus);
export const interviewDurationMinutesValidator = z
  .number()
  .int("Duration must be an integer")
  .positive("Duration must be positive")
  .optional();

// Job Interview
export const jobInterviewDisplayOrderValidator = z
  .number()
  .int("Display order must be an integer")
  .nonnegative("Display order cannot be negative");
export const jobInterviewIsMandatoryValidator = z.boolean();

// Interview Assignment
export const interviewAssignmentIdValidator = uuidValidator;
export const interviewAssignmentCreationSourceValidator = z.nativeEnum(InterviewAssignmentCreationSource);

// Interview Session
export const interviewSessionIdValidator = uuidValidator;
export const interviewSessionStatusValidator = z.nativeEnum(InterviewSessionStatus);
export const interviewSessionScheduledAtValidator = z.coerce.date();
export const interviewSessionStartedAtValidator = z.coerce.date().optional();
export const interviewSessionEndedAtValidator = z.coerce.date().optional();
export const interviewSessionRoomIdValidator = z.string().trim().optional();

// Interview Session Participant
export const interviewSessionParticipantIdValidator = uuidValidator;
export const interviewParticipantTypeValidator = z.nativeEnum(InterviewParticipantType);
export const interviewParticipantHasJoinedValidator = z.boolean();
export const interviewParticipantJoinedAtValidator = z.coerce.date().optional();

// AI Interview Configuration
export const aiInterviewConfigurationIdValidator = uuidValidator;
export const aiInterviewSystemPromptValidator = z.string().trim().optional();
export const aiInterviewEvaluationMetricsValidator = z.any().optional();
export const aiInterviewQuestionCountValidator = z
  .number()
  .int("Question count must be an integer")
  .positive("Question count must be positive")
  .optional();
export const aiInterviewDifficultyValidator = z.nativeEnum(QuestionDifficulty).optional();
export const aiInterviewAllowFollowUpsValidator = z.boolean().optional();

// AI Interview Question
export const aiInterviewQuestionIdValidator = uuidValidator;
export const aiInterviewQuestionSequenceValidator = z
  .number()
  .int("Sequence must be an integer")
  .positive("Sequence must be positive");
export const aiInterviewQuestionTextValidator = z
  .string()
  .trim()
  .min(5, "Question must be at least 5 characters long");
export const aiInterviewQuestionTopicValidator = z.string().trim().optional();
export const aiInterviewQuestionSkillValidator = z.string().trim().optional();
export const aiInterviewQuestionDifficultyValidator = z.nativeEnum(QuestionDifficulty).optional();
export const aiInterviewQuestionExpectedAreasValidator = z.any().optional();

// AI Interview Answer
export const aiInterviewAnswerIdValidator = uuidValidator;
export const aiInterviewAnswerTextValidator = z
  .string()
  .trim()
  .min(1, "Answer text cannot be empty");

// AI Interview Evaluation
export const aiInterviewEvaluationIdValidator = uuidValidator;
export const aiInterviewEvaluationScoreValidator = z
  .number()
  .min(0, "Score cannot be negative")
  .max(100, "Score cannot exceed 100");
export const aiInterviewEvaluationTechnicalAccuracyValidator = z
  .number()
  .min(0, "Technical accuracy score cannot be negative")
  .max(100, "Technical accuracy score cannot exceed 100")
  .optional();
export const aiInterviewEvaluationRelevanceValidator = z
  .number()
  .min(0, "Relevance score cannot be negative")
  .max(100, "Relevance score cannot exceed 100")
  .optional();
export const aiInterviewEvaluationCompletenessValidator = z
  .number()
  .min(0, "Completeness score cannot be negative")
  .max(100, "Completeness score cannot exceed 100")
  .optional();
export const aiInterviewEvaluationCommunicationValidator = z
  .number()
  .min(0, "Communication score cannot be negative")
  .max(100, "Communication score cannot exceed 100")
  .optional();
export const aiInterviewEvaluationFeedbackValidator = z
  .string()
  .trim()
  .max(2000, "Feedback must be at most 2000 characters long")
  .optional();
export const aiInterviewEvaluationStrengthsValidator = z.array(
  z.string().min(1)
);
export const aiInterviewEvaluationWeaknessesValidator = z.array(
  z.string().min(1)
);

// AI Interview Result
export const aiInterviewResultIdValidator = uuidValidator;
export const aiInterviewResultOverallScoreValidator = z
  .number()
  .min(0, "Overall score cannot be negative")
  .max(100, "Overall score cannot exceed 100");
export const aiInterviewResultTechnicalScoreValidator = z
  .number()
  .min(0, "Technical score cannot be negative")
  .max(100, "Technical score cannot exceed 100")
  .optional();
export const aiInterviewResultCommunicationScoreValidator = z
  .number()
  .min(0, "Communication score cannot be negative")
  .max(100, "Communication score cannot exceed 100")
  .optional();
export const aiInterviewResultProblemSolvingScoreValidator = z
  .number()
  .min(0, "Problem solving score cannot be negative")
  .max(100, "Problem solving score cannot exceed 100")
  .optional();
export const aiInterviewResultOverallFeedbackValidator = z
  .string()
  .trim()
  .max(3000, "Overall feedback must be at most 3000 characters long")
  .optional();
export const aiInterviewResultStrengthsValidator = z.any().optional();
export const aiInterviewResultWeaknessesValidator = z.any().optional();
export const aiInterviewResultRecommendationValidator = z.nativeEnum(AIRecommendation).optional();

// Interview Evaluation
export const interviewEvaluationOverallScoreValidator = z
  .number()
  .min(0, "Overall score cannot be negative")
  .max(100, "Overall score cannot exceed 100");

export const interviewEvaluationScoreValidator = z
  .number()
  .min(0, "Score cannot be negative")
  .max(100, "Score cannot exceed 100")
  .optional()
  .nullable();

export const interviewEvaluationRecommendationValidator = z
  .nativeEnum(AIRecommendation)
  .optional()
  .nullable();

export const interviewEvaluationStrengthsValidator = z
  .array(z.string().trim().min(1))
  .optional()
  .nullable();

export const interviewEvaluationImprovementsValidator = z
  .array(z.string().trim().min(1))
  .optional()
  .nullable();

export const interviewEvaluationCommentsValidator = z
  .string()
  .trim()
  .max(3000, "Comments must be at most 3000 characters long")
  .optional()
  .nullable();

