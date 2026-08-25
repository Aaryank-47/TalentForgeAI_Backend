import { QuestionType } from "@prisma/client";
import type { AuthTokenPayload } from "../../auth/interfaces/auth.interface.js";
import type { SectionQuestionItemView } from "../interfaces/question.interface.js";
import type { CreateAssessmentDto, UpdateAssessmentDto, GetAssessmentsQueryDto, CreateAssessmentSectionDto, UpdateAssessmentSectionDto, ReorderSectionsDto, AddQuestionsToSectionDto, UpdateSectionItemDto, ReorderQuestionsDto } from "../dto/assessmentBuilder.dto.js";
export declare class AssessmentBuilderService {
    static createAssessment(dto: CreateAssessmentDto, memberId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            title: string;
            status: import("@prisma/client").$Enums.AssessmentStatus;
            createdAt: Date;
        };
    }>;
    static getAssessments(filters: GetAssessmentsQueryDto, user: AuthTokenPayload): Promise<{
        data: ({
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
        })[];
        pagination: import("../../../common/types/pagination.types.js").PaginationMeta;
    }>;
    static getAssessmentById(assessmentId: string): Promise<{
        success: boolean;
        data: {
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
    }>;
    static updateAssessment(assessmentId: string, dto: UpdateAssessmentDto, memberId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    static deleteAssessment(assessmentId: string, memberId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    static publishAssessment(assessmentId: string, memberId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    static archiveAssessment(assessmentId: string, memberId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    static duplicateAssessment(assessmentId: string, memberId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            status: import("@prisma/client").$Enums.AssessmentStatus;
        };
    }>;
    static createAssessmentSection(assessmentId: string, dto: CreateAssessmentSectionDto): Promise<{
        id: string;
        title: string;
        sectionType: QuestionType;
        displayOrder: number;
    }>;
    static getAssessmentSections(assessmentId: string): Promise<{
        id: string;
        title: string;
        sectionType: import("@prisma/client").$Enums.QuestionType;
        durationMinutes: number | null;
        displayOrder: number;
        questionCount: number;
    }[]>;
    static updateAssessmentSection(sectionId: string, dto: UpdateAssessmentSectionDto): Promise<{
        success: boolean;
        message: string;
    }>;
    static deleteAssessmentSection(sectionId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    static reorderAssessmentSections(dto: ReorderSectionsDto): Promise<{
        success: boolean;
        message: string;
    }>;
    static addQuestionsToSection(sectionId: string, questions: AddQuestionsToSectionDto["questions"]): Promise<any>;
    static getSectionQuestions(sectionId: string, companyId: string): Promise<SectionQuestionItemView[]>;
    static updateSectionItem(sectionItemId: string, dto: UpdateSectionItemDto, companyId: string): Promise<void>;
    static removeQuestionFromSection(sectionItemId: string, companyId: string): Promise<void>;
    static reorderQuestions(dto: ReorderQuestionsDto, companyId: string): Promise<void>;
}
//# sourceMappingURL=assessmentBuilder.service.d.ts.map