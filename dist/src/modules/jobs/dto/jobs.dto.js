import { z } from "zod";
import { jobTitleValidator, jobDescriptionValidator, employmentTypeValidator, workplaceTypeValidator, minimumExperienceValidator, maximumExperienceValidator, minimumSalaryValidator, maximumSalaryValidator, salaryPeriodValidator, hideSalaryValidator, applicationDeadlineValidator, skillsValidator, benefitsValidator, } from "../../../common/validators/validators.js";
export const jobCreationDto = z.object({
    title: jobTitleValidator,
    description: jobDescriptionValidator,
    employmentType: employmentTypeValidator,
    workplaceType: workplaceTypeValidator,
    vacancies: z.number().int().min(1).optional().default(1),
    location: z.string().trim().min(2).max(150).optional(),
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
    .refine((data) => {
    if (data.minExperience !== undefined && data.maxExperience !== undefined) {
        return data.minExperience <= data.maxExperience;
    }
    return true;
}, {
    message: "Minimum experience cannot be greater than maximum experience",
    path: ["minExperience"],
})
    .refine((data) => {
    if (data.minimumSalary !== undefined && data.maximumSalary !== undefined) {
        return data.minimumSalary <= data.maximumSalary;
    }
    return true;
}, {
    message: "Minimum salary cannot be greater than maximum salary",
    path: ["minimumSalary"],
});
//# sourceMappingURL=jobs.dto.js.map