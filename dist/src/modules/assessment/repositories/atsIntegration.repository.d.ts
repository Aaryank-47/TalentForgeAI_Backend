export declare class ATSIntegrationRepository {
    static findApplicationById(id: string): Promise<({
        candidate: {
            userId: string;
        };
        job: {
            companyId: string;
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
    static findCompletedAttemptByApplication(applicationId: string): Promise<({
        assessment: {
            id: string;
            title: string;
            durationMinutes: number | null;
            passingScore: number | null;
            totalMarks: number | null;
            sections: ({
                items: ({
                    question: {
                        mcqDetail: ({
                            options: {
                                id: string;
                                displayOrder: number;
                                mcqDetailId: string;
                                optionText: string;
                                isCorrect: boolean;
                            }[];
                        } & {
                            id: string;
                            questionId: string;
                            allowMultipleCorrectAnswers: boolean;
                            negativeMarks: number;
                        }) | null;
                    } & {
                        type: import("@prisma/client").$Enums.QuestionType;
                        code: string | null;
                        companyId: string | null;
                        description: string;
                        id: string;
                        status: import("@prisma/client").$Enums.QuestionStatus;
                        createdAt: Date;
                        updatedAt: Date;
                        deletedAt: Date | null;
                        deletedById: string | null;
                        version: number;
                        title: string;
                        createdById: string | null;
                        updatedById: string | null;
                        archivedById: string | null;
                        publishedAt: Date | null;
                        archivedAt: Date | null;
                        difficulty: import("@prisma/client").$Enums.QuestionDifficulty;
                        estimatedTime: number;
                        defaultMarks: number;
                        ownership: import("@prisma/client").$Enums.QuestionOwnership;
                        createdByCompanyMemberId: string | null;
                        publishedById: string | null;
                        categoryId: string | null;
                        usageCount: number;
                        successRate: number | null;
                    };
                } & {
                    id: string;
                    sectionId: string;
                    displayOrder: number;
                    questionId: string;
                    marksOverride: number | null;
                    negativeMarksOverride: number | null;
                    timeLimitOverride: number | null;
                    isRequired: boolean;
                })[];
            } & {
                description: string | null;
                id: string;
                assessmentId: string;
                title: string;
                instructions: string | null;
                durationMinutes: number | null;
                displayOrder: number;
                sectionType: import("@prisma/client").$Enums.QuestionType;
            })[];
        };
        answers: ({
            question: {
                type: import("@prisma/client").$Enums.QuestionType;
                code: string | null;
                companyId: string | null;
                description: string;
                id: string;
                status: import("@prisma/client").$Enums.QuestionStatus;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                deletedById: string | null;
                version: number;
                title: string;
                createdById: string | null;
                updatedById: string | null;
                archivedById: string | null;
                publishedAt: Date | null;
                archivedAt: Date | null;
                difficulty: import("@prisma/client").$Enums.QuestionDifficulty;
                estimatedTime: number;
                defaultMarks: number;
                ownership: import("@prisma/client").$Enums.QuestionOwnership;
                createdByCompanyMemberId: string | null;
                publishedById: string | null;
                categoryId: string | null;
                usageCount: number;
                successRate: number | null;
            };
        } & {
            id: string;
            updatedAt: Date;
            questionId: string;
            startedAt: Date | null;
            submittedAt: Date | null;
            isCorrect: boolean | null;
            attemptId: string;
            score: number | null;
            feedback: string | null;
            selectedOptionIds: string[];
            attachmentUrls: string[];
            codeResponse: string | null;
            submissionUrl: string | null;
            meta: import("@prisma/client/runtime/client").JsonValue | null;
        })[];
    } & {
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
    }) | null>;
    static findAttemptWithAssessmentAndApplication(attemptId: string): Promise<({
        application: {
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
                profileVersion: number;
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
                requirementsVersion: number;
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
        };
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
    }) | null>;
    static findWorkflowStagesOrdered(workflowId: string): Promise<({
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
    })[]>;
    static findApplicationWorkflow(applicationId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        applicationId: string;
        workflowStageId: string;
        assignedEmployerId: string | null;
        remarks: string | null;
        movedAt: Date;
    } | null>;
    static findActiveCompanyMember(userId: string, companyId: string): Promise<{
        companyId: string;
        id: string;
        role: import("@prisma/client").$Enums.CompanyMemberRole;
        status: import("@prisma/client").$Enums.CompanyMemberStatus;
        userId: string;
        joinedAt: Date;
        invitationToken: string | null;
        invitedAt: Date | null;
        expiresAt: Date | null;
        invitedBy: string | null;
    } | null>;
}
//# sourceMappingURL=atsIntegration.repository.d.ts.map