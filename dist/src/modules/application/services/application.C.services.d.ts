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
                id: string;
                location: string | null;
                title: string;
                employmentType: import("@prisma/client").$Enums.EmploymentType;
                workplaceType: import("@prisma/client").$Enums.WorkplaceType;
                minimumSalary: number | null;
                maximumSalary: number | null;
                salaryPeriod: import("@prisma/client").$Enums.SalaryPeriod | null;
            };
        } & {
            id: string;
            status: import("@prisma/client").$Enums.ApplicationStatus;
            updatedAt: Date;
            jobId: string;
            candidateId: string;
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
            id: string;
            status: import("@prisma/client").$Enums.JobStatus;
            createdAt: Date;
            updatedAt: Date;
            visibility: import("@prisma/client").$Enums.JobVisibility;
            location: string | null;
            title: string;
            employmentType: import("@prisma/client").$Enums.EmploymentType;
            workplaceType: import("@prisma/client").$Enums.WorkplaceType;
            vacancies: number;
            minExperience: number;
            maxExperience: number;
            minimumSalary: number | null;
            maximumSalary: number | null;
            salaryPeriod: import("@prisma/client").$Enums.SalaryPeriod | null;
            hideSalary: boolean;
            applicationDeadline: Date | null;
            workflowId: string | null;
            summary: string | null;
            publishedAt: Date | null;
            closedAt: Date | null;
            archivedAt: Date | null;
            createdById: string;
            updatedById: string | null;
        };
        resume: {
            id: string;
            resumeUrl: string;
            resumeName: string;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        updatedAt: Date;
        jobId: string;
        candidateId: string;
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