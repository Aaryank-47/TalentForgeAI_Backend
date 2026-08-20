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
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                profilePicture: string | null;
                headline: string | null;
                bio: string | null;
                dateOfBirth: Date | null;
                gender: import("@prisma/client").$Enums.Gender | null;
                experienceLevel: import("@prisma/client").$Enums.ExperienceLevel | null;
                currentLocation: string | null;
                preferredLocation: string | null;
                currentCompany: string | null;
                currentDesignation: string | null;
                totalExperience: number | null;
                expectedSalary: number | null;
                currentSalary: number | null;
                noticePeriod: number | null;
                githubUrl: string | null;
                portfolioUrl: string | null;
                websiteUrl: string | null;
                isOpenToWork: boolean;
                profileCompletion: number;
            };
            resume: {
                id: string;
                deletedAt: Date | null;
                fileSize: number;
                candidateId: string;
                resumeUrl: string;
                resumeName: string;
                uploadedAt: Date;
                parsingStatus: import("@prisma/client").$Enums.ResumeParsingStatus;
                parsingStartedAt: Date | null;
                parsingCompletedAt: Date | null;
                parsingError: string | null;
                rawParsedData: import("@prisma/client/runtime/client").JsonValue | null;
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
    static getJobApplicationDetails(userId: string, applicationId: string): Promise<{
        candidate: {
            user: {
                email: string;
                status: import("@prisma/client").$Enums.AccountStatus;
            };
            skills: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                candidateId: string;
                skillId: string | null;
                yearsOfExperience: number | null;
            }[];
            educations: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                collegeName: string;
                degree: string;
                fieldOfStudy: string;
                startDate: Date;
                endDate: Date | null;
                currentlyStudying: boolean;
                gradingSystem: import("@prisma/client").$Enums.GradingSystem;
                gradeText: string | null;
                grade: number | null;
                candidateId: string;
            }[];
            experiences: {
                companyName: string;
                description: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                designation: string;
                location: string | null;
                employmentType: import("@prisma/client").$Enums.EmploymentType;
                startDate: Date;
                endDate: Date | null;
                currentlyWorking: boolean;
                candidateId: string;
            }[];
        } & {
            fullName: string;
            phoneNumber: string | null;
            linkedinUrl: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            profilePicture: string | null;
            headline: string | null;
            bio: string | null;
            dateOfBirth: Date | null;
            gender: import("@prisma/client").$Enums.Gender | null;
            experienceLevel: import("@prisma/client").$Enums.ExperienceLevel | null;
            currentLocation: string | null;
            preferredLocation: string | null;
            currentCompany: string | null;
            currentDesignation: string | null;
            totalExperience: number | null;
            expectedSalary: number | null;
            currentSalary: number | null;
            noticePeriod: number | null;
            githubUrl: string | null;
            portfolioUrl: string | null;
            websiteUrl: string | null;
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
            deletedAt: Date | null;
            fileSize: number;
            candidateId: string;
            resumeUrl: string;
            resumeName: string;
            uploadedAt: Date;
            parsingStatus: import("@prisma/client").$Enums.ResumeParsingStatus;
            parsingStartedAt: Date | null;
            parsingCompletedAt: Date | null;
            parsingError: string | null;
            rawParsedData: import("@prisma/client/runtime/client").JsonValue | null;
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
}
//# sourceMappingURL=application.E.serices.d.ts.map