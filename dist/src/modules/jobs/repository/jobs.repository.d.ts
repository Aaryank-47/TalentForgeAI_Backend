import type { JobCreationDto } from "../dto/jobs.dto.js";
export declare class JobsRepository {
    static createJob(data: JobCreationDto, slug: string, createdById: string): Promise<{
        skills: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            jobId: string;
            isRequired: boolean;
        }[];
        benefits: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            jobId: string;
            benefit: string;
        }[];
    } & {
        companyId: string;
        description: string;
        slug: string;
        id: string;
        status: import("@prisma/client").$Enums.JobStatus;
        createdAt: Date;
        updatedAt: Date;
        visibility: import("@prisma/client").$Enums.JobVisibility;
        location: string | null;
        title: string;
        employmentType: import("@prisma/client").$Enums.EmploymentType;
        workplaceType: import("@prisma/client").$Enums.WorkplaceType;
        minExperience: number;
        maxExperience: number;
        minimumSalary: number | null;
        maximumSalary: number | null;
        salaryPeriod: import("@prisma/client").$Enums.SalaryPeriod | null;
        hideSalary: boolean;
        applicationDeadline: Date | null;
        vacancies: number;
        summary: string | null;
        publishedAt: Date | null;
        closedAt: Date | null;
        archivedAt: Date | null;
        createdById: string;
        updatedById: string | null;
    }>;
}
//# sourceMappingURL=jobs.repository.d.ts.map