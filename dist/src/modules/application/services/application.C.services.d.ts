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
    }>;
    static withdrawApplication(userId: string, applicationId: string, status: ApplicationStatus, withdrawReason: string): Promise<void>;
}
//# sourceMappingURL=application.C.services.d.ts.map