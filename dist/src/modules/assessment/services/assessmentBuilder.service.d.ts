import type { AuthTokenPayload } from "../../auth/interfaces/auth.interface.js";
import type { CreateAssessmentDto, UpdateAssessmentDto, GetAssessmentsQueryDto } from "../dto/assessmentBuilder.dto.js";
export declare class AssessmentBuilderService {
    private static getOrCreateCompanyMember;
    static createAssessment(dto: CreateAssessmentDto, user: AuthTokenPayload): Promise<{
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
            publishedAt: Date | null;
            archivedAt: Date | null;
            createdById: string;
            updatedById: string | null;
            archivedById: string | null;
            instructions: string | null;
            durationMinutes: number | null;
            passingScore: number | null;
            totalMarks: number | null;
            isTemplate: boolean;
        })[];
        pagination: import("../../../common/types/pagination.types.js").PaginationMeta;
    }>;
    static getAssessmentById(assessmentId: string, user: AuthTokenPayload): Promise<{
        success: boolean;
        data: {
            _count: {
                jobs: number;
                attempts: number;
            };
            createdBy: {
                user: {
                    email: string;
                    fullName: never;
                    id: string;
                    profilePicture: never;
                };
            } & {
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
                        publishedAt: Date | null;
                        archivedAt: Date | null;
                        createdById: string | null;
                        updatedById: string | null;
                        categoryId: string | null;
                        difficulty: import("@prisma/client").$Enums.QuestionDifficulty;
                        estimatedTime: number;
                        defaultMarks: number;
                        ownership: import("@prisma/client").$Enums.QuestionOwnership;
                        code: string | null;
                        createdByCompanyMemberId: string | null;
                        publishedById: string | null;
                        archivedById: string | null;
                        usageCount: number;
                        successRate: number | null;
                    };
                } & {
                    id: string;
                    isRequired: boolean;
                    displayOrder: number;
                    questionId: string;
                    sectionId: string;
                    marksOverride: number | null;
                    negativeMarksOverride: number | null;
                    timeLimitOverride: number | null;
                })[];
            } & {
                description: string | null;
                id: string;
                title: string;
                displayOrder: number;
                instructions: string | null;
                durationMinutes: number | null;
                assessmentId: string;
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
            publishedAt: Date | null;
            archivedAt: Date | null;
            createdById: string;
            updatedById: string | null;
            archivedById: string | null;
            instructions: string | null;
            durationMinutes: number | null;
            passingScore: number | null;
            totalMarks: number | null;
            isTemplate: boolean;
        };
    }>;
    static updateAssessment(assessmentId: string, dto: UpdateAssessmentDto, user: AuthTokenPayload): Promise<{
        success: boolean;
        message: string;
    }>;
    static deleteAssessment(assessmentId: string, user: AuthTokenPayload): Promise<{
        success: boolean;
        message: string;
    }>;
    static publishAssessment(assessmentId: string, user: AuthTokenPayload): Promise<{
        success: boolean;
        message: string;
    }>;
    static archiveAssessment(assessmentId: string, user: AuthTokenPayload): Promise<{
        success: boolean;
        message: string;
    }>;
    static duplicateAssessment(assessmentId: string, user: AuthTokenPayload): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            status: import("@prisma/client").$Enums.AssessmentStatus;
        };
    }>;
}
//# sourceMappingURL=assessmentBuilder.service.d.ts.map