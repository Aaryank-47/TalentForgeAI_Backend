import { z } from "zod";
import {
    companyIdValidator,
    jobIdValidator,
    jobVacanciesValidator,
    locationValidator,
    jobTitleValidator,
    jobDescriptionValidator,
    employmentTypeValidator,
    workplaceTypeValidator,
    minimumExperienceValidator,
    maximumExperienceValidator,
    minimumSalaryValidator,
    maximumSalaryValidator,
    salaryPeriodValidator,
    hideSalaryValidator,
    applicationDeadlineValidator,
    skillsValidator,
    benefitsValidator,
} from "../../../common/validators/validators.js";

export const jobCreationDto = z.object({
    title: jobTitleValidator,
    description: jobDescriptionValidator,
    employmentType: employmentTypeValidator,
    workplaceType: workplaceTypeValidator,
    vacancies: jobVacanciesValidator,
    location: locationValidator,
    minExperience: minimumExperienceValidator,
    maxExperience: maximumExperienceValidator,
    minimumSalary: minimumSalaryValidator,
    maximumSalary: maximumSalaryValidator,
    salaryPeriod: salaryPeriodValidator,
    hideSalary: hideSalaryValidator,
    applicationDeadline: applicationDeadlineValidator,
    skills: skillsValidator,
    benefits: benefitsValidator,
})
.refine(
    (data) => {
        if (data.minExperience !== undefined && data.maxExperience !== undefined) {
            return data.minExperience <= data.maxExperience;
        }
        return true;
    },
    {
        message: "Minimum experience cannot be greater than maximum experience",
        path: ["minExperience"],
    }
)
.refine(
    (data) => {
        if (data.minimumSalary !== undefined && data.maximumSalary !== undefined) {
            return data.minimumSalary <= data.maximumSalary;
        }
        return true;
    },
    {
        message: "Minimum salary cannot be greater than maximum salary",
        path: ["minimumSalary"],
    }
);

export type JobCreationDto = z.infer<typeof jobCreationDto>;

export const jobUpdateDto = z.object({
    title: jobTitleValidator.optional(),
    description: jobDescriptionValidator.optional(),
    employmentType: employmentTypeValidator.optional(),
    workplaceType: workplaceTypeValidator.optional(),
    vacancies: jobVacanciesValidator.optional(),
    location: locationValidator.optional(),
    minExperience: minimumExperienceValidator.optional(),
    maxExperience: maximumExperienceValidator.optional(),
    minimumSalary: minimumSalaryValidator.optional(),
    maximumSalary: maximumSalaryValidator.optional(),
    salaryPeriod: salaryPeriodValidator.optional(),
    hideSalary: hideSalaryValidator.optional(),
    applicationDeadline: applicationDeadlineValidator.optional(),
    skills: skillsValidator.optional(),
    benefits: benefitsValidator.optional(),
})
.refine(
    (data) => {
        if (data.minExperience !== undefined && data.maxExperience !== undefined) {
            return data.minExperience <= data.maxExperience;
        }
        return true;
    },
    {
        message: "Minimum experience cannot be greater than maximum experience",
        path: ["minExperience"],
    }
)
.refine(
    (data) => {
        if (data.minimumSalary !== undefined && data.maximumSalary !== undefined) {
            return data.minimumSalary <= data.maximumSalary;
        }
        return true;
    },
    {
        message: "Minimum salary cannot be greater than maximum salary",
        path: ["minimumSalary"],
    }
);

export type JobUpdateDto = z.infer<typeof jobUpdateDto>;

export const jobDetailsParamDto = z.object({
    companyId: companyIdValidator,
    jobId: jobIdValidator,
});

export type JobDetailsParamDto = z.infer<typeof jobDetailsParamDto>;
