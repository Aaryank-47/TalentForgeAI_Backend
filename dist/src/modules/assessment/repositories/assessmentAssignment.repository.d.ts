import type { Job, Assessment, CompanyMember, Prisma } from "@prisma/client";
export declare class JobAssessmentRepository {
    static findJobById(jobId: string): Promise<Job | null>;
    static validateJobWorkflowSupportsAssessments(jobId: string): Promise<void>;
    static findActiveCompanyMember(userId: string, companyId: string): Promise<CompanyMember | null>;
    static findAssessmentById(assessmentId: string): Promise<Assessment | null>;
    static attachAssessmentsToJob(jobId: string, jobCompanyId: string, assessments: {
        assessmentId: string;
        displayOrder?: number | undefined;
        isMandatory?: boolean | undefined;
    }[]): Promise<number>;
    static findJobAssessmentsByJobId(jobId: string): Promise<({
        assessment: {
            id: string;
            status: import("@prisma/client").$Enums.AssessmentStatus;
            title: string;
            durationMinutes: number | null;
        };
    } & {
        createdAt: Date;
        assessmentId: string;
        jobId: string;
        displayOrder: number;
        isMandatory: boolean;
    })[]>;
    static findJobAssessment(jobId: string, assessmentId: string): Promise<({
        assessment: {
            companyId: string;
            description: string | null;
            id: string;
            status: import("@prisma/client").$Enums.AssessmentStatus;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            deletedById: string | null;
            title: string;
            instructions: string | null;
            durationMinutes: number | null;
            passingScore: number | null;
            totalMarks: number | null;
            isTemplate: boolean;
            createdById: string;
            updatedById: string | null;
            archivedById: string | null;
            publishedAt: Date | null;
            archivedAt: Date | null;
        };
    } & {
        createdAt: Date;
        assessmentId: string;
        jobId: string;
        displayOrder: number;
        isMandatory: boolean;
    }) | null>;
    static syncJobAssessments(jobId: string, jobCompanyId: string, assessments: {
        assessmentId: string;
        displayOrder?: number | undefined;
        isMandatory?: boolean | undefined;
    }[]): Promise<number>;
    static removeJobAssessment(jobId: string, assessmentId: string): Promise<void>;
    static reorderJobAssessments(jobId: string, updates: {
        assessmentId: string;
        displayOrder: number;
    }[]): Promise<void>;
    static findInvitationByApplicationAndAssessment(applicationId: string, assessmentId: string): Promise<{
        token: string;
        id: string;
        status: import("@prisma/client").$Enums.InvitationStatus;
        createdAt: Date;
        updatedAt: Date;
        expiresAt: Date;
        assessmentId: string;
        applicationId: string;
        idempotencyKey: string | null;
    } | null>;
    static createAssessmentInvitation(data: Prisma.AssessmentInvitationUncheckedCreateInput): Promise<{
        token: string;
        id: string;
        status: import("@prisma/client").$Enums.InvitationStatus;
        createdAt: Date;
        updatedAt: Date;
        expiresAt: Date;
        assessmentId: string;
        applicationId: string;
        idempotencyKey: string | null;
    }>;
    static findApplicationForInvitation(applicationId: string): Promise<({
        candidate: {
            fullName: string;
            user: {
                email: string;
            };
        };
        job: {
            companyId: string;
            jobAssessments: {
                assessment: {
                    id: string;
                    status: import("@prisma/client").$Enums.AssessmentStatus;
                    title: string;
                };
                assessmentId: string;
            }[];
        };
        applicationWorkflow: ({
            workflowStage: {
                assessmentId: string | null;
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
        assessmentInvitations: {
            token: string;
            id: string;
            status: import("@prisma/client").$Enums.InvitationStatus;
            createdAt: Date;
            updatedAt: Date;
            expiresAt: Date;
            assessmentId: string;
            applicationId: string;
            idempotencyKey: string | null;
        }[];
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
    static findAssessmentForInvitation(assessmentId: string): Promise<{
        companyId: string;
        description: string | null;
        id: string;
        status: import("@prisma/client").$Enums.AssessmentStatus;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        deletedById: string | null;
        title: string;
        instructions: string | null;
        durationMinutes: number | null;
        passingScore: number | null;
        totalMarks: number | null;
        isTemplate: boolean;
        createdById: string;
        updatedById: string | null;
        archivedById: string | null;
        publishedAt: Date | null;
        archivedAt: Date | null;
    } | null>;
    static findInvitationWithAttempt(applicationId: string): Promise<({
        application: {
            id: string;
            assessmentAttempts: {
                id: string;
                status: import("@prisma/client").$Enums.AttemptStatus;
                createdAt: Date;
                updatedAt: Date;
                candidateId: string;
                assessmentId: string;
                applicationId: string;
                currentSectionId: string | null;
                startedAt: Date | null;
                submittedAt: Date | null;
                lastActivityAt: Date | null;
                attemptNumber: number;
                timeTakenInSeconds: number | null;
                completedDurationSeconds: number | null;
                overallScore: number | null;
                percentage: number | null;
                passed: boolean | null;
                evaluationStatus: import("@prisma/client").$Enums.EvaluationStatus;
                reviewStatus: import("@prisma/client").$Enums.ReviewStatus;
            }[];
            job: {
                company: {
                    companyName: string;
                    logo: string | null;
                    id: string;
                };
                location: string | null;
                id: string;
                title: string;
                workplaceType: import("@prisma/client").$Enums.WorkplaceType;
            };
        };
        assessment: {
            description: string | null;
            company: {
                companyName: string;
                logo: string | null;
                id: string;
            };
            id: string;
            title: string;
            instructions: string | null;
            durationMinutes: number | null;
            passingScore: number | null;
            totalMarks: number | null;
        };
    } & {
        token: string;
        id: string;
        status: import("@prisma/client").$Enums.InvitationStatus;
        createdAt: Date;
        updatedAt: Date;
        expiresAt: Date;
        assessmentId: string;
        applicationId: string;
        idempotencyKey: string | null;
    }) | null>;
    static findInvitationByToken(token: string): Promise<({
        application: {
            candidate: {
                fullName: string;
            };
            assessmentAttempts: {
                id: string;
                status: import("@prisma/client").$Enums.AttemptStatus;
                createdAt: Date;
                updatedAt: Date;
                candidateId: string;
                assessmentId: string;
                applicationId: string;
                currentSectionId: string | null;
                startedAt: Date | null;
                submittedAt: Date | null;
                lastActivityAt: Date | null;
                attemptNumber: number;
                timeTakenInSeconds: number | null;
                completedDurationSeconds: number | null;
                overallScore: number | null;
                percentage: number | null;
                passed: boolean | null;
                evaluationStatus: import("@prisma/client").$Enums.EvaluationStatus;
                reviewStatus: import("@prisma/client").$Enums.ReviewStatus;
            }[];
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
        };
        assessment: {
            companyId: string;
            id: string;
            title: string;
            durationMinutes: number | null;
        };
    } & {
        token: string;
        id: string;
        status: import("@prisma/client").$Enums.InvitationStatus;
        createdAt: Date;
        updatedAt: Date;
        expiresAt: Date;
        assessmentId: string;
        applicationId: string;
        idempotencyKey: string | null;
    }) | null>;
    static findInvitationById(id: string): Promise<({
        application: {
            candidate: {
                fullName: string;
                user: {
                    email: string;
                };
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
        };
        assessment: {
            companyId: string;
            id: string;
            title: string;
        };
    } & {
        token: string;
        id: string;
        status: import("@prisma/client").$Enums.InvitationStatus;
        createdAt: Date;
        updatedAt: Date;
        expiresAt: Date;
        assessmentId: string;
        applicationId: string;
        idempotencyKey: string | null;
    }) | null>;
    static updateInvitationStatus(id: string, status: any): Promise<{
        token: string;
        id: string;
        status: import("@prisma/client").$Enums.InvitationStatus;
        createdAt: Date;
        updatedAt: Date;
        expiresAt: Date;
        assessmentId: string;
        applicationId: string;
        idempotencyKey: string | null;
    }>;
    static findInvitationByIdempotencyKey(idempotencyKey: string): Promise<({
        assessment: {
            companyId: string;
            id: string;
        };
    } & {
        token: string;
        id: string;
        status: import("@prisma/client").$Enums.InvitationStatus;
        createdAt: Date;
        updatedAt: Date;
        expiresAt: Date;
        assessmentId: string;
        applicationId: string;
        idempotencyKey: string | null;
    }) | null>;
    static createAssessmentAttempt(data: any): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.AttemptStatus;
        createdAt: Date;
        updatedAt: Date;
        candidateId: string;
        assessmentId: string;
        applicationId: string;
        currentSectionId: string | null;
        startedAt: Date | null;
        submittedAt: Date | null;
        lastActivityAt: Date | null;
        attemptNumber: number;
        timeTakenInSeconds: number | null;
        completedDurationSeconds: number | null;
        overallScore: number | null;
        percentage: number | null;
        passed: boolean | null;
        evaluationStatus: import("@prisma/client").$Enums.EvaluationStatus;
        reviewStatus: import("@prisma/client").$Enums.ReviewStatus;
    }>;
}
//# sourceMappingURL=assessmentAssignment.repository.d.ts.map