import { ApplicationStatus } from "../../../common/enums/all_enums.js";
import type { ApplicationView } from "../interfaces/application.interface.js";
export declare class ApplicationService {
    static applyJob(resumeId: string, jobId: string, userId: string): Promise<ApplicationView>;
    static getCandidateApplications(userId: string, filters: {
        page?: number | undefined;
        limit?: number | undefined;
        status?: string | undefined;
        search?: string | undefined;
    }): Promise<{
        applications: ({
            job: {
                company: {
                    companyName: string;
                    logo: string | null;
                    id: string;
                };
                employmentType: import("@prisma/client").$Enums.EmploymentType;
                location: string | null;
                id: string;
                title: string;
                workplaceType: import("@prisma/client").$Enums.WorkplaceType;
                minimumSalary: number | null;
                maximumSalary: number | null;
                salaryPeriod: import("@prisma/client").$Enums.SalaryPeriod | null;
            };
        } & {
            id: string;
            status: import("@prisma/client").$Enums.ApplicationStatus;
            updatedAt: Date;
            candidateId: string;
            jobId: string;
            resumeId: string;
            coverLetter: string | null;
            appliedAt: Date;
            lastStatusUpdatedAt: Date | null;
            withdrawnAt: Date | null;
            withdrawReason: string | null;
            rejectedAt: Date | null;
            rejectionReason: string | null;
            hiredAt: Date | null;
        })[];
        total: number;
    }>;
    static getCandidateApplicationDetails(userId: string, applicationId: string): Promise<{
        resume: {
            id: string;
            resumeName: string;
            resumeUrl: string;
        };
        job: {
            company: {
                companyName: string;
                website: string | null;
                logo: string | null;
                description: string | null;
                id: string;
            };
        } & {
            companyId: string;
            description: string;
            slug: string;
            employmentType: import("@prisma/client").$Enums.EmploymentType;
            location: string | null;
            id: string;
            status: import("@prisma/client").$Enums.JobStatus;
            createdAt: Date;
            updatedAt: Date;
            visibility: import("@prisma/client").$Enums.JobVisibility;
            title: string;
            createdById: string;
            updatedById: string | null;
            publishedAt: Date | null;
            archivedAt: Date | null;
            summary: string | null;
            workplaceType: import("@prisma/client").$Enums.WorkplaceType;
            vacancies: number;
            minExperience: number;
            maxExperience: number;
            minimumSalary: number | null;
            maximumSalary: number | null;
            salaryPeriod: import("@prisma/client").$Enums.SalaryPeriod | null;
            hideSalary: boolean;
            applicationDeadline: Date | null;
            closedAt: Date | null;
            workflowId: string | null;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        updatedAt: Date;
        candidateId: string;
        jobId: string;
        resumeId: string;
        coverLetter: string | null;
        appliedAt: Date;
        lastStatusUpdatedAt: Date | null;
        withdrawnAt: Date | null;
        withdrawReason: string | null;
        rejectedAt: Date | null;
        rejectionReason: string | null;
        hiredAt: Date | null;
    }>;
    static withdrawApplication(userId: string, applicationId: string, status: ApplicationStatus, withdrawReason: string): Promise<void>;
}
//# sourceMappingURL=application.C.services.d.ts.map