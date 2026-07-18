import type { CompanyMemberRole, User, EmploymentType, WorkplaceType, SalaryPeriod, JobSkill as Skill, JobBenefit as Benefit } from "@prisma/client";
export interface Job {
    id: string;
    companyId: string;
    title: string;
    description: string;
    employmentType: EmploymentType;
    workplaceType: WorkplaceType;
    location: string;
    minExperience: number;
    maxExperience: number;
    minimumSalary: number;
    maximumSalary: number;
    salaryPeriod: SalaryPeriod;
    hideSalary: boolean;
    applicationDeadline: Date;
    skills: Skill[];
    benefits: Benefit[];
    isPublished: boolean;
}
export interface JobView extends Job {
    skills: Skill[];
    benefits: Benefit[];
    companyMemberRole: CompanyMemberRole;
    author: User;
}
//# sourceMappingURL=jobs.interface.d.ts.map