import prisma from "../../../config/database.js";
export class JobsRepository {
    static async createJob(data, slug, createdById) {
        return prisma.job.create({
            data: {
                companyId: data.companyId,
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
            },
            include: {
                skills: true,
                benefits: true,
            },
        });
    }
}
//# sourceMappingURL=jobs.repository.js.map