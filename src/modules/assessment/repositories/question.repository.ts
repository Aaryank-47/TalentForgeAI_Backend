import prisma from "../../../config/database.js";
import type { QuestionCategory } from "@prisma/client";
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
}