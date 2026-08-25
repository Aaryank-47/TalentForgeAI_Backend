import { EvaluationStatus } from "@prisma/client";
export declare class AssessmentEvaluationRepository {
    static findAttemptById(id: string): Promise<({
        candidate: {
            userId: string;
        };
        assessment: {
            companyId: string;
            id: string;
            title: string;
            durationMinutes: number | null;
            passingScore: number | null;
            totalMarks: number | null;
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
    static findAttemptWithAnswersAndQuestions(id: string): Promise<({
        assessment: {
            sections: ({
                items: ({
                    question: {
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
                            supportedLanguages: {
                                createdAt: Date;
                                dsaDetailId: string;
                                programmingLanguageId: string;
                            }[];
                            testCases: {
                                type: import("@prisma/client").$Enums.TestCaseType;
                                input: string;
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                displayOrder: number;
                                dsaDetailId: string;
                                expectedOutput: string;
                                explanation: string | null;
                            }[];
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
                        createdById: string | null;
                        updatedById: string | null;
                        archivedById: string | null;
                        publishedAt: Date | null;
                        archivedAt: Date | null;
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
        } & {
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
        answers: {
            id: string;
            updatedAt: Date;
            questionId: string;
            startedAt: Date | null;
            submittedAt: Date | null;
            attemptId: string;
            score: number | null;
            isCorrect: boolean | null;
            feedback: string | null;
            selectedOptionIds: string[];
            attachmentUrls: string[];
            codeResponse: string | null;
            submissionUrl: string | null;
            meta: import("@prisma/client/runtime/client").JsonValue | null;
        }[];
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
    static updateEvaluationStatus(id: string, status: EvaluationStatus): Promise<{
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
    static updateAssessmentAttemptResult(id: string, overallScore: number, percentage: number, passed: boolean, evaluationStatus: EvaluationStatus): Promise<{
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
    static findQuestionInSectionItem(assessmentId: string, questionId: string): Promise<({
        question: {
            dsaDetail: ({
                supportedLanguages: {
                    createdAt: Date;
                    dsaDetailId: string;
                    programmingLanguageId: string;
                }[];
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
            createdById: string | null;
            updatedById: string | null;
            archivedById: string | null;
            publishedAt: Date | null;
            archivedAt: Date | null;
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
    }) | null>;
    static findAnswerByAttemptAndQuestion(attemptId: string, questionId: string): Promise<{
        id: string;
        updatedAt: Date;
        questionId: string;
        startedAt: Date | null;
        submittedAt: Date | null;
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
    static updateQuestionEvaluation(attemptId: string, questionId: string, score: number, feedback: string | null, isCorrect: boolean | null): Promise<{
        id: string;
        updatedAt: Date;
        questionId: string;
        startedAt: Date | null;
        submittedAt: Date | null;
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
    static checkActiveCompanyMember(userId: string, companyId: string): Promise<{
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
//# sourceMappingURL=assessmentEvaluation.repository.d.ts.map