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
                name
            }
        })
    }

    static async findQueCategoryByNameAndParent(
        name: string,
        parentId: string | null
    ): Promise<QuestionCategory | null> {
        return await prisma.questionCategory.findFirst({
            where: {
                name,
                parentId: parentId ?? null
            }
        })
    }

    static async findQuestionCategoryById(
        id: string
    ): Promise<QuestionCategory | null> {
        return await prisma.questionCategory.findUnique({
            where: {
                id
            }
        })
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
        })
    }

    static async countQuestionCategories(
        filters: GetQuestionCategoriesDto
    ): Promise<number> {

        return prisma.questionCategory.count({
            where: {
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
                children: true,
            },
        });
    }
}