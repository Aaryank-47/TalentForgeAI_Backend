import type { Assessment, AssessmentSection, AssessmentSectionItem, Prisma } from "@prisma/client";
import { QuestionType, QuestionDifficulty } from "@prisma/client";
import type { GetAssessmentsQueryDto } from "../dto/assessmentBuilder.dto.js";
import type { PaginationResult } from "../../../common/types/pagination.types.js";
export declare class AssessmentBuilderRepository {
    static createAssessment(data: Prisma.AssessmentUncheckedCreateInput): Promise<Assessment>;
    static findAssessmentById(id: string): Promise<({
        _count: {
            jobs: number;
            attempts: number;
        };
        createdBy: {
            user: {
                email: string;
                id: string;
                employer: {
                    fullName: string;
                    profilePicture: string | null;
                } | null;
            };
        } & {
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
        };
        sections: ({
            items: ({
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
                    version: number;
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
    }) | null>;
    static findAssessments(filters: GetAssessmentsQueryDto, pagination: PaginationResult, companyIds?: string[]): Promise<({
        _count: {
            sections: number;
            attempts: number;
        };
        sections: {
            id: string;
            title: string;
            displayOrder: number;
            sectionType: import("@prisma/client").$Enums.QuestionType;
        }[];
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
    })[]>;
    static countAssessments(filters: GetAssessmentsQueryDto, companyIds?: string[]): Promise<number>;
    static findAssessmentByTitleInCompany(title: string, companyId: string): Promise<Assessment | null>;
    static updateAssessment(id: string, data: Prisma.AssessmentUncheckedUpdateInput): Promise<Assessment>;
    static hasActiveAttempts(assessmentId: string): Promise<boolean>;
    static isAssignedToJob(assessmentId: string): Promise<boolean>;
    static softDeleteAssessment(id: string, deletedById: string): Promise<Assessment>;
    static duplicateAssessment(assessmentId: string, memberId: string): Promise<Assessment>;
    static findSectionByTitle(assessmentId: string, title: string): Promise<AssessmentSection | null>;
    static getMaxDisplayOrder(assessmentId: string): Promise<number>;
    static createSection(data: Prisma.AssessmentSectionUncheckedCreateInput): Promise<AssessmentSection>;
    static findSectionById(id: string): Promise<({
        _count: {
            items: number;
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
        description: string | null;
        id: string;
        assessmentId: string;
        title: string;
        instructions: string | null;
        durationMinutes: number | null;
        displayOrder: number;
        sectionType: import("@prisma/client").$Enums.QuestionType;
    }) | null>;
    static updateSection(id: string, data: Prisma.AssessmentSectionUncheckedUpdateInput): Promise<AssessmentSection>;
    static deleteSection(id: string): Promise<AssessmentSection>;
    static recalculateDisplayOrder(assessmentId: string): Promise<void>;
    static reorderSections(assessmentId: string, updates: {
        sectionId: string;
        displayOrder: number;
    }[]): Promise<void>;
    static findSectionsByAssessmentId(assessmentId: string): Promise<({
        _count: {
            items: number;
        };
    } & {
        description: string | null;
        id: string;
        assessmentId: string;
        title: string;
        instructions: string | null;
        durationMinutes: number | null;
        displayOrder: number;
        sectionType: import("@prisma/client").$Enums.QuestionType;
    })[]>;
    private static buildWhereClause;
    static findQuestionsAlreadyAdded(sectionId: string, questionIds: string[]): Promise<{
        questionId: string;
    }[]>;
    static addQuestionsToSection(sectionId: string, companyId: string, sectionType: QuestionType, questions: {
        questionId: string;
        marksOverride: number | null | undefined;
        timeLimitOverride: number | null | undefined;
    }[]): Promise<{
        id: string;
        sectionId: string;
        displayOrder: number;
        questionId: string;
        marksOverride: number | null;
        negativeMarksOverride: number | null;
        timeLimitOverride: number | null;
        isRequired: boolean;
    }[]>;
    static findSectionItems(sectionId: string): Promise<(AssessmentSectionItem & {
        question: {
            id: string;
            title: string;
            difficulty: QuestionDifficulty;
            defaultMarks: number;
        };
    })[]>;
    static findSectionItemById(id: string): Promise<({
        section: {
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
            description: string | null;
            id: string;
            assessmentId: string;
            title: string;
            instructions: string | null;
            durationMinutes: number | null;
            displayOrder: number;
            sectionType: import("@prisma/client").$Enums.QuestionType;
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
    static updateSectionItem(id: string, data: Prisma.AssessmentSectionItemUncheckedUpdateInput): Promise<AssessmentSectionItem>;
    static deleteSectionItem(id: string): Promise<AssessmentSectionItem>;
    static recalculateItemsDisplayOrder(sectionId: string): Promise<void>;
    static reorderSectionItems(sectionId: string, updates: {
        sectionItemId: string;
        displayOrder: number;
    }[]): Promise<void>;
    static publishDraftQuestionsByIds(questionIds: string[]): Promise<Prisma.BatchPayload>;
}
//# sourceMappingURL=assessmentBuilder.repository.d.ts.map