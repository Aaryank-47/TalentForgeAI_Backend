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
    jobStatusValidator,
    userIdValidator,
    uuidValidator,
    workflowIdValidator
} from "../../../common/validators/validators.js";

export class JobsDto {
    static createJob = z.object({
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
        workflowId: workflowIdValidator,
        status: jobStatusValidator.optional()
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

    static updateJob = z.object({
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
        workflowId: workflowIdValidator.optional(),
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

    static jobDetailsParam = z.object({
        companyId: companyIdValidator,
        jobId: jobIdValidator,
    });

    static statusUpdate = z.object({
        status: jobStatusValidator,
    });

    static assignRecruiterToJob = z.object({
        jobId: jobIdValidator,
        recruiterId: userIdValidator,
    });

    static assignCompanyMemberToJob = z.object({
        companyMemberId: uuidValidator,
    });

    static jobAssignmentMemberParams = z.object({
        companyId: companyIdValidator,
        jobId: jobIdValidator,
    });

    static listAssignedMembersParams = z.object({
        companyId: companyIdValidator,
        jobId: jobIdValidator,
    });

    static removeAssignedCompanyMembers = z.object({
        companyMemberIds: z.array(uuidValidator).min(1, "At least one company member ID must be provided"),
    });
}

export type JobCreationDto = z.infer<typeof JobsDto.createJob>;
export type JobUpdateDto = z.infer<typeof JobsDto.updateJob>;
export type JobDetailsParamDto = z.infer<typeof JobsDto.jobDetailsParam>;
export type StatusUpdateDto = z.infer<typeof JobsDto.statusUpdate>;
export type AssignRecruiterToJobDto = z.infer<typeof JobsDto.assignRecruiterToJob>;
export type AssignCompanyMemberToJobDto = z.infer<typeof JobsDto.assignCompanyMemberToJob>;
export type JobAssignmentMemberParamsDto = z.infer<typeof JobsDto.jobAssignmentMemberParams>;
export type ListAssignedMembersParamsDto = z.infer<typeof JobsDto.listAssignedMembersParams>;
export type RemoveAssignedCompanyMembersDto = z.infer<typeof JobsDto.removeAssignedCompanyMembers>;
