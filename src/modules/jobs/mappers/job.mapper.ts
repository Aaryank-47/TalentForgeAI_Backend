import { Prisma } from "@prisma/client";
import type { JobCreationDto, JobUpdateDto } from "../dto/jobs.dto.js";
import { removeUndefined } from "../../../common/helper/object.helper.js";
export function toJobCreateInput(
    companyId: string,
    data: JobCreationDto,
    slug: string,
    createdById: string
): Prisma.JobCreateInput {
    return {
        company: {
            connect: {
                id: companyId,
            },
        },
        title: data.title,
        slug,
        description: data.description,
        employmentType: data.employmentType,
        workplaceType: data.workplaceType,
        vacancies: data.vacancies ?? 1,
        location: data.location ?? null,
        minExperience: data.minExperience ?? 0,
        maxExperience: data.maxExperience ?? 0,
        minimumSalary: data.minimumSalary ?? null,
        maximumSalary: data.maximumSalary ?? null,
        salaryPeriod: data.salaryPeriod ?? null,
        hideSalary: data.hideSalary ?? false,
        applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : null,
        createdById,
        skills: {
            create: data.skills.map((skill) => ({
                name: skill,
                isRequired: true,
            })),
        },
        benefits: {
            create: (data.benefits || []).map((benefit) => ({
                benefit,
            })),
        },
    }
}

export function toJobUpdateInput(
    jobPayload: JobUpdateDto
): Prisma.JobUpdateInput {

    const data: Prisma.JobUpdateInput = removeUndefined({
        title: jobPayload.title,
        description: jobPayload.description,
        employmentType: jobPayload.employmentType,
        workplaceType: jobPayload.workplaceType,
        vacancies: jobPayload.vacancies,
        location: jobPayload.location,
        minExperience: jobPayload.minExperience,
        maxExperience: jobPayload.maxExperience,
        minimumSalary: jobPayload.minimumSalary,
        maximumSalary: jobPayload.maximumSalary,
        salaryPeriod: jobPayload.salaryPeriod,
        hideSalary: jobPayload.hideSalary,
        applicationDeadline: jobPayload.applicationDeadline
            ? new Date(jobPayload.applicationDeadline)
            : undefined,
    }) as Prisma.JobUpdateInput;

    if (jobPayload.skills !== undefined) {
        data.skills = {
            deleteMany: {},
            create: jobPayload.skills.map((skill) => ({
                name: skill,
                isRequired: true,
            })),
        };
    }

    if (jobPayload.benefits !== undefined) {
        data.benefits = {
            deleteMany: {},
            create: jobPayload.benefits.map((benefit) => ({
                benefit,
            })),
        };
    }

    return data;
}