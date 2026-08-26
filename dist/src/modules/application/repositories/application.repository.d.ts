import { ApplicationStatus } from "../../../common/enums/all_enums.js";
export declare class ApplicationRepository {
    static getAppliationById(applicationId: string): Promise<({
        candidate: {
            user: {
                email: string;
                password: string;
                otp: string | null;
                id: string;
                otpExpiresAt: Date | null;
                resetPasswordToken: string | null;
                resetPasswordTokenExpiresAt: Date | null;
                role: import("@prisma/client").$Enums.UserRole;
                status: import("@prisma/client").$Enums.AccountStatus;
                isEmailVerified: boolean;
                lastLoginAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                deletedById: string | null;
                suspendedAt: Date | null;
                suspendedById: string | null;
                suspendedReason: string | null;
                restoredAt: Date | null;
                restoredById: string | null;
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
        job: {
            company: {
                companyName: string;
                phoneNumber: string | null;
                website: string | null;
                logo: string | null;
                coverImage: string | null;
                description: string | null;
                industry: string | null;
                companySize: string | null;
                foundedYear: number | null;
                headquarters: string | null;
                linkedinUrl: string | null;
                twitterUrl: string | null;
                slug: string;
                id: string;
                status: import("@prisma/client").$Enums.CompanyStatus;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                suspendedAt: Date | null;
                suspendedReason: string | null;
                restoredAt: Date | null;
                deletedBy: string | null;
                suspendedBy: string | null;
                restoredBy: string | null;
                profileCompletion: number;
                companyEmail: string | null;
                visibility: import("@prisma/client").$Enums.CompanyVisibility;
                isVerified: boolean;
                verifiedAt: Date | null;
                verifiedBy: string | null;
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
        coverLetter: string | null;
        appliedAt: Date;
        lastStatusUpdatedAt: Date | null;
        withdrawnAt: Date | null;
        withdrawReason: string | null;
        rejectedAt: Date | null;
        rejectionReason: string | null;
        hiredAt: Date | null;
    }) | null>;
    static getApplicationsByIds(applicationIds: string[]): Promise<({
        candidate: {
            user: {
                email: string;
                password: string;
                otp: string | null;
                id: string;
                otpExpiresAt: Date | null;
                resetPasswordToken: string | null;
                resetPasswordTokenExpiresAt: Date | null;
                role: import("@prisma/client").$Enums.UserRole;
                status: import("@prisma/client").$Enums.AccountStatus;
                isEmailVerified: boolean;
                lastLoginAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                deletedById: string | null;
                suspendedAt: Date | null;
                suspendedById: string | null;
                suspendedReason: string | null;
                restoredAt: Date | null;
                restoredById: string | null;
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
        job: {
            companyId: string;
            company: {
                companyName: string;
                phoneNumber: string | null;
                website: string | null;
                logo: string | null;
                coverImage: string | null;
                description: string | null;
                industry: string | null;
                companySize: string | null;
                foundedYear: number | null;
                headquarters: string | null;
                linkedinUrl: string | null;
                twitterUrl: string | null;
                slug: string;
                id: string;
                status: import("@prisma/client").$Enums.CompanyStatus;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                suspendedAt: Date | null;
                suspendedReason: string | null;
                restoredAt: Date | null;
                deletedBy: string | null;
                suspendedBy: string | null;
                restoredBy: string | null;
                profileCompletion: number;
                companyEmail: string | null;
                visibility: import("@prisma/client").$Enums.CompanyVisibility;
                isVerified: boolean;
                verifiedAt: Date | null;
                verifiedBy: string | null;
            };
            id: string;
            title: string;
            workflowId: string | null;
        };
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
    })[]>;
    static getJobApplicationByJobId(jobId: string): Promise<({
        candidate: {
            fullName: string;
            user: {
                email: string;
            };
            id: string;
        };
        applicationWorkflow: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            applicationId: string;
            workflowStageId: string;
            assignedEmployerId: string | null;
            remarks: string | null;
            movedAt: Date;
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
    })[]>;
    static getResume(resumeId: string): Promise<{
        id: string;
        updatedAt: Date;
        deletedAt: Date | null;
        candidateId: string;
        resumeName: string;
        resumeUrl: string;
        fileSize: number;
        uploadedAt: Date;
        parsingStatus: import("@prisma/client").$Enums.ResumeParsingStatus;
        parsingStartedAt: Date | null;
        parsingCompletedAt: Date | null;
        parsingError: string | null;
        rawParsedData: import("@prisma/client/runtime/client").JsonValue | null;
    } | null>;
    static getJob(jobId: string): Promise<{
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
    } | null>;
    static getApplication(candidateId: string, jobId: string): Promise<{
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
    } | null>;
    static createApplication(data: {
        candidateId: string;
        jobId: string;
        sourceResumeId: string;
        fileName: string;
        fileUrl: string;
        fileSize: number;
        status: ApplicationStatus;
    }): Promise<{
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
    static getCandidateApplications(params: {
        candidateId: string;
        page: number;
        limit: number;
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
            applicationResume: {
                id: string;
                createdAt: Date;
                fileSize: number;
                applicationId: string;
                fileName: string;
                fileUrl: string;
                sourceResumeId: string | null;
            } | null;
            applicationWorkflow: ({
                workflowHistories: ({
                    fromStage: ({
                        stageLibrary: {
                            type: import("@prisma/client").$Enums.StageType;
                            companyId: string | null;
                            description: string | null;
                            name: string;
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            isActive: boolean;
                        };
                    } & {
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        assessmentId: string | null;
                        workflowId: string;
                        stageLibraryId: string;
                        order: number;
                        isEnabled: boolean;
                        isFinal: boolean;
                        interviewId: string | null;
                    }) | null;
                    toStage: {
                        stageLibrary: {
                            type: import("@prisma/client").$Enums.StageType;
                            companyId: string | null;
                            description: string | null;
                            name: string;
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            isActive: boolean;
                        };
                    } & {
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        assessmentId: string | null;
                        workflowId: string;
                        stageLibraryId: string;
                        order: number;
                        isEnabled: boolean;
                        isFinal: boolean;
                        interviewId: string | null;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    toStageId: string;
                    fromStageId: string | null;
                    applicationWorkflowId: string;
                    movedByEmployerId: string | null;
                    comment: string | null;
                })[];
                workflowStage: {
                    workflow: {
                        stages: ({
                            stageLibrary: {
                                type: import("@prisma/client").$Enums.StageType;
                                companyId: string | null;
                                description: string | null;
                                name: string;
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                isActive: boolean;
                            };
                        } & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            assessmentId: string | null;
                            workflowId: string;
                            stageLibraryId: string;
                            order: number;
                            isEnabled: boolean;
                            isFinal: boolean;
                            interviewId: string | null;
                        })[];
                    } & {
                        companyId: string;
                        description: string | null;
                        name: string;
                        id: string;
                        status: import("@prisma/client").$Enums.WorkflowStatus;
                        createdAt: Date;
                        updatedAt: Date;
                        isDefault: boolean;
                    };
                    stageLibrary: {
                        type: import("@prisma/client").$Enums.StageType;
                        companyId: string | null;
                        description: string | null;
                        name: string;
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        isActive: boolean;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    assessmentId: string | null;
                    workflowId: string;
                    stageLibraryId: string;
                    order: number;
                    isEnabled: boolean;
                    isFinal: boolean;
                    interviewId: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                applicationId: string;
                workflowStageId: string;
                assignedEmployerId: string | null;
                remarks: string | null;
                movedAt: Date;
            }) | null;
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
    static getCandidateApplicationDetails(candidateId: string, applicationId: string): Promise<({
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
        applicationResume: {
            id: string;
            fileSize: number;
            fileName: string;
            fileUrl: string;
            sourceResumeId: string | null;
        } | null;
        applicationWorkflow: ({
            workflowHistories: ({
                fromStage: ({
                    stageLibrary: {
                        type: import("@prisma/client").$Enums.StageType;
                        companyId: string | null;
                        description: string | null;
                        name: string;
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        isActive: boolean;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    assessmentId: string | null;
                    workflowId: string;
                    stageLibraryId: string;
                    order: number;
                    isEnabled: boolean;
                    isFinal: boolean;
                    interviewId: string | null;
                }) | null;
                toStage: {
                    stageLibrary: {
                        type: import("@prisma/client").$Enums.StageType;
                        companyId: string | null;
                        description: string | null;
                        name: string;
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        isActive: boolean;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    assessmentId: string | null;
                    workflowId: string;
                    stageLibraryId: string;
                    order: number;
                    isEnabled: boolean;
                    isFinal: boolean;
                    interviewId: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                toStageId: string;
                fromStageId: string | null;
                applicationWorkflowId: string;
                movedByEmployerId: string | null;
                comment: string | null;
            })[];
            workflowStage: {
                workflow: {
                    stages: ({
                        stageLibrary: {
                            type: import("@prisma/client").$Enums.StageType;
                            companyId: string | null;
                            description: string | null;
                            name: string;
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            isActive: boolean;
                        };
                    } & {
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        assessmentId: string | null;
                        workflowId: string;
                        stageLibraryId: string;
                        order: number;
                        isEnabled: boolean;
                        isFinal: boolean;
                        interviewId: string | null;
                    })[];
                } & {
                    companyId: string;
                    description: string | null;
                    name: string;
                    id: string;
                    status: import("@prisma/client").$Enums.WorkflowStatus;
                    createdAt: Date;
                    updatedAt: Date;
                    isDefault: boolean;
                };
                stageLibrary: {
                    type: import("@prisma/client").$Enums.StageType;
                    companyId: string | null;
                    description: string | null;
                    name: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    isActive: boolean;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                assessmentId: string | null;
                workflowId: string;
                stageLibraryId: string;
                order: number;
                isEnabled: boolean;
                isFinal: boolean;
                interviewId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            applicationId: string;
            workflowStageId: string;
            assignedEmployerId: string | null;
            remarks: string | null;
            movedAt: Date;
        }) | null;
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
    }) | null>;
    static updateApplicationStatus(applicationId: string, status: ApplicationStatus, withdrawReason?: string): Promise<void>;
    static getCompanyApplications(params: {
        companyId: string;
        jobId?: string | undefined;
        status?: string | undefined;
        search?: string | undefined;
        page: number;
        limit: number;
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
    static getJobApplications(params: {
        jobId: string;
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
    static getJobApplicationDetails(applicationId: string): Promise<({
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
    }) | null>;
}
//# sourceMappingURL=application.repository.d.ts.map