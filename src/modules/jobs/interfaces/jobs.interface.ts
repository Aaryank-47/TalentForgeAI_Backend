import type {
    CompanyMemberRole,
    EmploymentType,
    WorkplaceType,
    SalaryPeriod,
    JobSkill as Skill,
    JobBenefit as Benefit
} from "@prisma/client";
import type { AuthUserView } from "../../auth/interfaces/auth.interface.js";

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
    author: AuthUserView;
}

export interface JobsListView {
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
    author: AuthUserView
}
