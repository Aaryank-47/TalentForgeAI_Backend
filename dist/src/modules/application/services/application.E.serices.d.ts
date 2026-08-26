export declare class EmployerApplicationService {
    static getJobApplications(userId: string, jobId: string, query: {
        page: number;
        limit: number;
        status?: string | undefined;
        search?: string | undefined;
    }): Promise<{
        applications: ({
            candidate: {
                user: {
                    email: string;
                    status: import("@prisma/client").$Enums.AccountStatus;
                };
            } & {
                fullName: string;
                phoneNumber: string | null;
                linkedinUrl: string | null;
                currentLocation: string | null;
                githubUrl: string | null;
                portfolioUrl: string | null;
                websiteUrl: string | null;
                headline: string | null;
                bio: string | null;
                currentCompany: string | null;
                currentDesignation: string | null;
                totalExperience: number | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                profilePicture: string | null;
                dateOfBirth: Date | null;
                gender: import("@prisma/client").$Enums.Gender | null;
                experienceLevel: import("@prisma/client").$Enums.ExperienceLevel | null;
                preferredLocation: string | null;
                expectedSalary: number | null;
                currentSalary: number | null;
                noticePeriod: number | null;
                isOpenToWork: boolean;
                profileCompletion: number;
            };
            applicationResume: {
                id: string;
                createdAt: Date;
                fileSize: number;
                applicationId: string;
                fileName: string;
                fileUrl: string;
                sourceResumeId: string | null;
            } | null;
        } & {
            id: string;
            status: import("@prisma/client").$Enums.ApplicationStatus;
            updatedAt: Date;
            candidateId: string;
            jobId: string;
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
    static getJobApplicationDetails(userId: string, applicationId: string): Promise<{
        candidate: {
            skills: {
                name: string;
                yearsOfExperience: number | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                candidateId: string;
                skillId: string | null;
            }[];
            user: {
                email: string;
                status: import("@prisma/client").$Enums.AccountStatus;
            };
            educations: {
                startDate: Date;
                endDate: Date | null;
                collegeName: string;
                degree: string;
                fieldOfStudy: string;
                currentlyStudying: boolean;
                gradingSystem: import("@prisma/client").$Enums.GradingSystem;
                gradeText: string | null;
                grade: number | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                candidateId: string;
            }[];
            experiences: {
                companyName: string;
                description: string | null;
                designation: string;
                currentlyWorking: boolean;
                employmentType: import("@prisma/client").$Enums.EmploymentType;
                location: string | null;
                startDate: Date;
                endDate: Date | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                candidateId: string;
            }[];
        } & {
            fullName: string;
            phoneNumber: string | null;
            linkedinUrl: string | null;
            currentLocation: string | null;
            githubUrl: string | null;
            portfolioUrl: string | null;
            websiteUrl: string | null;
            headline: string | null;
            bio: string | null;
            currentCompany: string | null;
            currentDesignation: string | null;
            totalExperience: number | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            profilePicture: string | null;
            dateOfBirth: Date | null;
            gender: import("@prisma/client").$Enums.Gender | null;
            experienceLevel: import("@prisma/client").$Enums.ExperienceLevel | null;
            preferredLocation: string | null;
            expectedSalary: number | null;
            currentSalary: number | null;
            noticePeriod: number | null;
            isOpenToWork: boolean;
            profileCompletion: number;
        };
        job: {
            company: {
                companyName: string;
                logo: string | null;
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
        applicationResume: {
            id: string;
            createdAt: Date;
            fileSize: number;
            applicationId: string;
            fileName: string;
            fileUrl: string;
            sourceResumeId: string | null;
        } | null;
    } & {
        id: string;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        updatedAt: Date;
        candidateId: string;
        jobId: string;
        coverLetter: string | null;
        appliedAt: Date;
        lastStatusUpdatedAt: Date | null;
        withdrawnAt: Date | null;
        withdrawReason: string | null;
        rejectedAt: Date | null;
        rejectionReason: string | null;
        hiredAt: Date | null;
    }>;
}
//# sourceMappingURL=application.E.serices.d.ts.map