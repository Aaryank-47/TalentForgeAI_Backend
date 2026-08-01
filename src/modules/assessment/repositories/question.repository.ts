import prisma from "../../../config/database.js";
import type { QuestionCategory } from "@prisma/client";
import type { GetQuestionCategoriesDto } from "../dto/question.dto.js";
import type { PaginationResult } from "../../../common/types/pagination.types.js";

export class QuestionRepository {
    static async findQueCateogoryByName(
        name: string
    ): Promise<QuestionCategory | null> {
        return await prisma.questionCategory.findFirst({
            where: {
                name,
                deletedAt: null
            }
        });
    }

    static async findQueCategoryByNameAndParent(
        name: string,
        parentId: string | null
    ): Promise<QuestionCategory | null> {
        return await prisma.questionCategory.findFirst({
            where: {
                name,
                parentId: parentId ?? null,
                deletedAt: null
            }
        });
    }

    static async findQuestionCategoryById(
        id: string
    ): Promise<QuestionCategory | null> {
        return await prisma.questionCategory.findFirst({
            where: {
                id,
                deletedAt: null
            }
        });
    }

    static async createQueCategory(
        name: string,
        parentId?: string | null
    ): Promise<QuestionCategory> {
        return await prisma.questionCategory.create({
            data: {
                name,
                parentId: parentId ?? null
            }
        });
    }

    static async updateQueCategory(
        id: string,
        data: {
            name?: string | undefined;
            displayOrder?: number | undefined;
            parentId?: string | null | undefined
        }
    ): Promise<QuestionCategory> {
        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;
        if (data.parentId !== undefined) updateData.parentId = data.parentId;

        return await prisma.questionCategory.update({
            where: { id },
            data: updateData,
        });
    }

    static async softDeleteQueCategory(
        id: string
    ): Promise<QuestionCategory> {
        return await prisma.questionCategory.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }

    static async hasChildCategories(id: string): Promise<boolean> {
        const count = await prisma.questionCategory.count({
            where: {
                parentId: id,
                deletedAt: null,
            },
        });
        return count > 0;
    }

    static async hasQuestions(id: string): Promise<boolean> {
        const count = await prisma.question.count({
            where: {
                categoryId: id,
                deletedAt: null,
            },
        });
        return count > 0;
    }

    static async countQuestionCategories(
        filters: GetQuestionCategoriesDto
    ): Promise<number> {
        return prisma.questionCategory.count({
            where: {
                deletedAt: null,
                ...(filters.search && {
                    name: {
                        contains: filters.search,
                        mode: "insensitive",
                    },
                }),
                ...(filters.parentId && {
                    parentId: filters.parentId,
                }),
            },
        });
    }

    static async getAllQueCategories(
        filters: GetQuestionCategoriesDto,
        pagination: PaginationResult
    ) {
        return prisma.questionCategory.findMany({
            where: {
                deletedAt: null,
                ...(filters.search && {
                    name: {
                        contains: filters.search,
                        mode: "insensitive",
                    },
                }),
                ...(filters.parentId && {
                    parentId: filters.parentId,
                }),
            },
            skip: pagination.skip,
            take: pagination.take,
            orderBy: {
                [pagination.sortBy]: pagination.sortOrder,
            },
            include: {
                parent: true,
                children: {
                    where: {
                        deletedAt: null
                    }
                },
            },
        });
    }
}
