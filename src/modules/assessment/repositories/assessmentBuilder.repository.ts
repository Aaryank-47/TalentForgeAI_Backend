import prisma from "../../../config/database.js";
import type { Assessment, AssessmentSection, AssessmentSectionItem, Prisma } from "@prisma/client";
import { QuestionType, QuestionDifficulty } from "@prisma/client";
import type { GetAssessmentsQueryDto } from "../dto/assessmentBuilder.dto.js";
import type { PaginationResult } from "../../../common/types/pagination.types.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { ForbiddenError } from "../../../common/errors/ForbiddenError.js";

export class AssessmentBuilderRepository {
    static async createAssessment(data: Prisma.AssessmentUncheckedCreateInput): Promise<Assessment> {
        return await prisma.assessment.create({
            data
        });
    }


    static async findAssessmentById(
        id: string
    ) {
        return await prisma.assessment.findFirst({
            where: {
                id,
                deletedAt: null
            },
            include: {
                sections: {
                    orderBy: { displayOrder: "asc" },
                    include: {
                        items: {
                            orderBy: { displayOrder: "asc" },
                            include: {
                                question: true
                            }
                        }
                    }
                },
                createdBy: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                employer: {
                                    select: {
                                        fullName: true,
                                        profilePicture: true
                                    }
                                }
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        attempts: true,
                        jobs: true
                    }
                }
            }
        });
    }

    static async findAssessments(filters: GetAssessmentsQueryDto, pagination: PaginationResult, companyIds?: string[]) {
        const where = this.buildWhereClause(filters, companyIds);
        return await prisma.assessment.findMany({
            where,
            skip: pagination.skip,
            take: pagination.take,
            orderBy: {
                [pagination.sortBy]: pagination.sortOrder
            },
            include: {
                _count: {
                    select: {
                        sections: true,
                        attempts: true
                    }
                }
            }
        });
    }

    static async countAssessments(filters: GetAssessmentsQueryDto, companyIds?: string[]): Promise<number> {
        const where = this.buildWhereClause(filters, companyIds);
        return await prisma.assessment.count({ where });
    }

    static async findAssessmentByTitleInCompany(title: string, companyId: string): Promise<Assessment | null> {
        return await prisma.assessment.findFirst({
            where: {
                title: {
                    equals: title,
                    mode: "insensitive"
                },
                companyId,
                deletedAt: null
            }
        });
    }

    static async updateAssessment(id: string, data: Prisma.AssessmentUncheckedUpdateInput): Promise<Assessment> {
        return await prisma.assessment.update({
            where: { id },
            data
        });
    }

    static async hasActiveAttempts(assessmentId: string): Promise<boolean> {
        const count = await prisma.assessmentAttempt.count({
            where: {
                assessmentId,
                status: {
                    in: ["NOT_STARTED", "IN_PROGRESS"]
                }
            }
        });
        return count > 0;
    }

    static async isAssignedToJob(assessmentId: string): Promise<boolean> {
        const count = await prisma.jobAssessment.count({
            where: {
                assessmentId
            }
        });
        return count > 0;
    }

    static async softDeleteAssessment(id: string, deletedById: string): Promise<Assessment> {
        return await prisma.assessment.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedById
            }
        });
    }

    static async duplicateAssessment(assessmentId: string, memberId: string): Promise<Assessment> {
        return await prisma.$transaction(async (tx) => {
            const original = await tx.assessment.findFirst({
                where: { id: assessmentId, deletedAt: null },
                include: {
                    sections: {
                        include: {
                            items: true
                        }
                    }
                }
            });

            if (!original) {
                throw new Error("Assessment not found");
            }

            // Generate a copy title
            const duplicateTitle = `Copy of ${original.title}`.substring(0, 150);

            const newAssessment = await tx.assessment.create({
                data: {
                    companyId: original.companyId,
                    title: duplicateTitle,
                    description: original.description,
                    instructions: original.instructions,
                    durationMinutes: original.durationMinutes,
                    passingScore: original.passingScore,
                    totalMarks: original.totalMarks,
                    isTemplate: original.isTemplate,
                    status: "DRAFT",
                    createdById: memberId
                }
            });

            for (const section of original.sections) {
                const newSection = await tx.assessmentSection.create({
                    data: {
                        assessmentId: newAssessment.id,
                        title: section.title,
                        description: section.description,
                        instructions: section.instructions,
                        durationMinutes: section.durationMinutes,
                        displayOrder: section.displayOrder,
                        sectionType: section.sectionType
                    }
                });

                if (section.items.length > 0) {
                    await tx.assessmentSectionItem.createMany({
                        data: section.items.map((item) => ({
                            sectionId: newSection.id,
                            questionId: item.questionId,
                            displayOrder: item.displayOrder,
                            marksOverride: item.marksOverride,
                            negativeMarksOverride: item.negativeMarksOverride,
                            timeLimitOverride: item.timeLimitOverride,
                            isRequired: item.isRequired
                        }))
                    });
                }
            }

            return newAssessment;
        });
    }

    static async findSectionByTitle(assessmentId: string, title: string): Promise<AssessmentSection | null> {
        return await prisma.assessmentSection.findFirst({
            where: {
                assessmentId,
                title: {
                    equals: title,
                    mode: "insensitive"
                }
            }
        });
    }

    static async getMaxDisplayOrder(assessmentId: string): Promise<number> {
        const result = await prisma.assessmentSection.aggregate({
            where: { assessmentId },
            _max: { displayOrder: true }
        });
        return result._max.displayOrder ?? 0;
    }

    static async createSection(data: Prisma.AssessmentSectionUncheckedCreateInput): Promise<AssessmentSection> {
        return await prisma.assessmentSection.create({
            data
        });
    }

    static async findSectionById(id: string) {
        return await prisma.assessmentSection.findUnique({
            where: { id },
            include: {
                assessment: true,
                _count: {
                    select: { items: true }
                }
            }
        });
    }

    static async updateSection(id: string, data: Prisma.AssessmentSectionUncheckedUpdateInput): Promise<AssessmentSection> {
        return await prisma.assessmentSection.update({
            where: { id },
            data
        });
    }

    static async deleteSection(id: string): Promise<AssessmentSection> {
        return await prisma.assessmentSection.delete({
            where: { id }
        });
    }

    static async recalculateDisplayOrder(assessmentId: string): Promise<void> {
        await prisma.$transaction(async (tx) => {
            const sections = await tx.assessmentSection.findMany({
                where: { assessmentId },
                orderBy: { displayOrder: "asc" }
            });

            let order = 1;
            for (const section of sections) {
                await tx.assessmentSection.update({
                    where: { id: section.id },
                    data: { displayOrder: order++ }
                });
            }
        });
    }

    static async reorderSections(
        assessmentId: string,
        updates: { sectionId: string; displayOrder: number; }[]
    ): Promise<void> {
        await prisma.$transaction(async (tx) => {
            // First set displayOrder to a large temporary value to avoid unique constraint violations
            for (const item of updates) {
                await tx.assessmentSection.update({
                    where: { id: item.sectionId },
                    data: { displayOrder: item.displayOrder + 10000 }
                });
            }

            // Then set the final desired displayOrder
            for (const item of updates) {
                await tx.assessmentSection.update({
                    where: { id: item.sectionId },
                    data: { displayOrder: item.displayOrder }
                });
            }
        });
    }

    static async findSectionsByAssessmentId(assessmentId: string) {
        return await prisma.assessmentSection.findMany({
            where: { assessmentId },
            orderBy: { displayOrder: "asc" },
            include: {
                _count: {
                    select: { items: true }
                }
            }
        });
    }

    private static buildWhereClause(filters: GetAssessmentsQueryDto, companyIds?: string[]): Prisma.AssessmentWhereInput {
        return {
            deletedAt: null,
            ...(companyIds && { companyId: { in: companyIds } }),
            ...(!companyIds && filters.companyId && { companyId: filters.companyId }),
            ...(filters.status && { status: filters.status }),
            ...(filters.isTemplate !== undefined && { isTemplate: filters.isTemplate }),
            ...(filters.search && {
                title: {
                    contains: filters.search,
                    mode: "insensitive"
                }
            })
        };
    }

    static async findQuestionsAlreadyAdded(
        sectionId: string,
        questionIds: string[]
    ): Promise<{ questionId: string }[]> {
        return await prisma.assessmentSectionItem.findMany({
            where: {
                sectionId,
                questionId: { in: questionIds }
            },
            select: {
                questionId: true,
            }
        });
    }

    static async addQuestionsToSection(
        sectionId: string,
        companyId: string,
        sectionType: QuestionType,
        questions: {
            questionId: string;
            marksOverride: number | null | undefined;
            timeLimitOverride: number | null | undefined;
        }[]
    ) {
        return await prisma.$transaction(async (tx) => {
            // Get current max display order for items in the section
            const maxItem = await tx.assessmentSectionItem.findFirst({
                where: { sectionId },
                orderBy: { displayOrder: "desc" },
                select: { displayOrder: true }
            });
            let currentMaxOrder = maxItem?.displayOrder ?? 0;

            const createdItems = [];

            for (const questionInput of questions) {
                const question = await tx.question.findFirst({
                    where: {
                        id: questionInput.questionId,
                        deletedAt: null
                    }
                });

                if (!question) {
                    throw new NotFoundError(`Question not found: ${questionInput.questionId}`);
                }

                if (question.status !== "PUBLISHED") {
                    throw new ConflictError(`Question is not published: ${question.title}`);
                }

                if (question.ownership === "COMPANY" && question.companyId !== companyId) {
                    throw new ForbiddenError(`You do not have permission to access question: ${question.title}`);
                }
                if (question.type !== sectionType) {
                    throw new ConflictError(`Question type '${question.type}' does not match section type '${sectionType}': ${question.title}`);
                }

                const existingItem = await tx.assessmentSectionItem.findFirst({
                    where: {
                        sectionId,
                        questionId: questionInput.questionId
                    }
                });

                if (existingItem) {
                    throw new ConflictError(`Question is already added to this section: ${question.title}`);
                }

                currentMaxOrder += 1;
                const newItem = await tx.assessmentSectionItem.create({
                    data: {
                        sectionId,
                        questionId: questionInput.questionId,
                        displayOrder: currentMaxOrder,
                        marksOverride: questionInput.marksOverride ?? null,
                        timeLimitOverride: questionInput.timeLimitOverride ?? null
                    }
                });
                createdItems.push(newItem);
            }

            return createdItems;
        });
    }

    static async findSectionItems(
        sectionId: string
    ): Promise<(AssessmentSectionItem & {
        question: {
            id: string;
            title: string;
            difficulty: QuestionDifficulty;
            defaultMarks: number;
        };
    })[]> {
        return await prisma.assessmentSectionItem.findMany({
            where: { sectionId },
            orderBy: { displayOrder: "asc" },
            include: {
                question: {
                    select: {
                        id: true,
                        title: true,
                        difficulty: true,
                        defaultMarks: true
                    }
                }
            }
        });
    }
}
