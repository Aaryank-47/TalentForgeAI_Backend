import { AttemptStatus, InvitationStatus } from "@prisma/client";
export declare class AssessmentAttemptRepository {
    static findCandidateByUserId(userId: string): Promise<{
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
    } | null>;
    static findInvitationByToken(token: string): Promise<({
        application: {
            candidate: {
                fullName: string;
                id: string;
                userId: string;
            };
            assessmentAttempts: {
                id: string;
                status: import("@prisma/client").$Enums.AttemptStatus;
                createdAt: Date;
                updatedAt: Date;
                assessmentId: string;
                candidateId: string;
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
        };
        assessment: {
            companyId: string;
            id: string;
            status: import("@prisma/client").$Enums.AssessmentStatus;
            deletedAt: Date | null;
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
        idempotencyKey: string | null;
        applicationId: string;
    }) | null>;
    static updateInvitationStatus(id: string, status: InvitationStatus): Promise<{
        token: string;
        id: string;
        status: import("@prisma/client").$Enums.InvitationStatus;
        createdAt: Date;
        updatedAt: Date;
        expiresAt: Date;
        assessmentId: string;
        idempotencyKey: string | null;
        applicationId: string;
    }>;
    static createAssessmentAttempt(data: any): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.AttemptStatus;
        createdAt: Date;
        updatedAt: Date;
        assessmentId: string;
        candidateId: string;
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
    static findAttemptById(id: string): Promise<({
        candidate: {
            userId: string;
        };
        assessment: {
            companyId: string;
            description: string | null;
            id: string;
            status: import("@prisma/client").$Enums.AssessmentStatus;
            title: string;
            instructions: string | null;
            durationMinutes: number | null;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.AttemptStatus;
        createdAt: Date;
        updatedAt: Date;
        assessmentId: string;
        candidateId: string;
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
    static findAttemptsByCandidate(candidateId: string, filters: {
        status?: any;
    }, skip: number, limit: number): Promise<({
        assessment: {
            title: string;
            durationMinutes: number | null;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.AttemptStatus;
        createdAt: Date;
        updatedAt: Date;
        assessmentId: string;
        candidateId: string;
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
    })[]>;
    static countAttemptsByCandidate(candidateId: string, filters: {
        status?: AttemptStatus;
    }): Promise<number>;
    static findInvitationByApplicationAndAssessment(applicationId: string, assessmentId: string): Promise<{
        token: string;
        id: string;
        status: import("@prisma/client").$Enums.InvitationStatus;
        createdAt: Date;
        updatedAt: Date;
        expiresAt: Date;
        assessmentId: string;
        idempotencyKey: string | null;
        applicationId: string;
    } | null>;
    static updateAttemptStatus(id: string, status: AttemptStatus, submittedAt?: Date): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.AttemptStatus;
        createdAt: Date;
        updatedAt: Date;
        assessmentId: string;
        candidateId: string;
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
    static checkActiveCompanyMember(userId: string, companyId: string): Promise<{
        companyId: string;
        id: string;
        role: import("@prisma/client").$Enums.CompanyMemberRole;
        status: import("@prisma/client").$Enums.CompanyMemberStatus;
        userId: string;
        expiresAt: Date | null;
        joinedAt: Date;
        invitationToken: string | null;
        invitedAt: Date | null;
        invitedBy: string | null;
    } | null>;
    static findQuestionInSectionItem(assessmentId: string, questionId: string): Promise<{
        id: string;
        isRequired: boolean;
        sectionId: string;
        questionId: string;
        displayOrder: number;
        marksOverride: number | null;
        negativeMarksOverride: number | null;
        timeLimitOverride: number | null;
    } | null>;
    static findQuestionWithDetails(id: string): Promise<({
        machineCodingDetail: {
            id: string;
            questionId: string;
            repositoryTemplate: string | null;
            projectStructure: string | null;
            techStack: string | null;
            implementationInstructions: string;
            evaluationGuidelines: string | null;
        } | null;
        projectDetail: {
            id: string;
            questionId: string;
            requirements: string;
            submissionInstructions: string;
            deadlineHours: number;
        } | null;
        mcqDetail: ({
            options: {
                id: string;
                displayOrder: number;
                isCorrect: boolean;
                mcqDetailId: string;
                optionText: string;
            }[];
        } & {
            id: string;
            questionId: string;
            allowMultipleCorrectAnswers: boolean;
            negativeMarks: number;
        }) | null;
        dsaDetail: ({
            supportedLanguages: ({
                programmingLanguage: {
                    slug: string;
                    name: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    isActive: boolean;
                };
            } & {
                createdAt: Date;
                dsaDetailId: string;
                programmingLanguageId: string;
            })[];
        } & {
            id: string;
            questionId: string;
            starterCode: string;
            referenceSolution: string;
            memoryLimit: number;
            timeLimit: number;
        }) | null;
    } & {
        type: import("@prisma/client").$Enums.QuestionType;
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
        publishedAt: Date | null;
        archivedAt: Date | null;
        createdById: string | null;
        updatedById: string | null;
        archivedById: string | null;
        difficulty: import("@prisma/client").$Enums.QuestionDifficulty;
        estimatedTime: number;
        defaultMarks: number;
        ownership: import("@prisma/client").$Enums.QuestionOwnership;
        code: string | null;
        createdByCompanyMemberId: string | null;
        publishedById: string | null;
        categoryId: string | null;
        usageCount: number;
        successRate: number | null;
    }) | null>;
    static findAnswerByAttemptAndQuestion(attemptId: string, questionId: string): Promise<{
        id: string;
        updatedAt: Date;
        startedAt: Date | null;
        submittedAt: Date | null;
        questionId: string;
        attemptId: string;
        score: number | null;
        isCorrect: boolean | null;
        feedback: string | null;
        selectedOptionIds: string[];
        attachmentUrls: string[];
        codeResponse: string | null;
        submissionUrl: string | null;
        meta: import("@prisma/client/runtime/client").JsonValue | null;
    } | null>;
    static createAnswer(data: {
        attemptId: string;
        questionId: string;
        startedAt?: Date | null;
        selectedOptionIds?: string[];
        attachmentUrls?: string[];
        codeResponse?: string | null;
        submissionUrl?: string | null;
        meta?: any;
    }): Promise<{
        id: string;
        updatedAt: Date;
        startedAt: Date | null;
        submittedAt: Date | null;
        questionId: string;
        attemptId: string;
        score: number | null;
        isCorrect: boolean | null;
        feedback: string | null;
        selectedOptionIds: string[];
        attachmentUrls: string[];
        codeResponse: string | null;
        submissionUrl: string | null;
        meta: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    static upsertAnswer(attemptId: string, questionId: string, data: {
        selectedOptionIds?: string[];
        attachmentUrls?: string[];
        codeResponse?: string | null;
        submissionUrl?: string | null;
        meta?: any;
    }): Promise<{
        id: string;
        updatedAt: Date;
        startedAt: Date | null;
        submittedAt: Date | null;
        questionId: string;
        attemptId: string;
        score: number | null;
        isCorrect: boolean | null;
        feedback: string | null;
        selectedOptionIds: string[];
        attachmentUrls: string[];
        codeResponse: string | null;
        submissionUrl: string | null;
        meta: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    static findAnswersByAttempt(attemptId: string): Promise<{
        id: string;
        updatedAt: Date;
        startedAt: Date | null;
        submittedAt: Date | null;
        questionId: string;
        attemptId: string;
        score: number | null;
        isCorrect: boolean | null;
        feedback: string | null;
        selectedOptionIds: string[];
        attachmentUrls: string[];
        codeResponse: string | null;
        submissionUrl: string | null;
        meta: import("@prisma/client/runtime/client").JsonValue | null;
    }[]>;
    static deleteAnswer(attemptId: string, questionId: string): Promise<{
        id: string;
        updatedAt: Date;
        startedAt: Date | null;
        submittedAt: Date | null;
        questionId: string;
        attemptId: string;
        score: number | null;
        isCorrect: boolean | null;
        feedback: string | null;
        selectedOptionIds: string[];
        attachmentUrls: string[];
        codeResponse: string | null;
        submissionUrl: string | null;
        meta: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
}
//# sourceMappingURL=candidateAssessment.repository.d.ts.map