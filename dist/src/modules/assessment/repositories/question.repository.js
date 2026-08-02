import prisma from "../../../config/database.js";
export class QuestionRepository {
    static async findQueCateogoryByName(name) {
        return await prisma.questionCategory.findFirst({
            where: {
                name,
                deletedAt: null
            }
        });
    }
    static async findQueCategoryByNameAndParent(name, parentId) {
        return await prisma.questionCategory.findFirst({
            where: {
                name,
                parentId: parentId ?? null,
                deletedAt: null
            }
        });
    }
    static async findQuestionCategoryById(id) {
        return await prisma.questionCategory.findFirst({
            where: {
                id,
                deletedAt: null
            }
        });
    }
    static async createQueCategory(name, parentId) {
        return await prisma.questionCategory.create({
            data: {
                name,
                parentId: parentId ?? null
            }
        });
    }
    static async updateQueCategory(id, data) {
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.displayOrder !== undefined)
            updateData.displayOrder = data.displayOrder;
        if (data.parentId !== undefined)
            updateData.parentId = data.parentId;
        return await prisma.questionCategory.update({
            where: { id },
            data: updateData,
        });
    }
    static async softDeleteQueCategory(id) {
        return await prisma.questionCategory.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    static async hasChildCategories(id) {
        const count = await prisma.questionCategory.count({
            where: {
                parentId: id,
                deletedAt: null,
            },
        });
        return count > 0;
    }
    static async hasQuestions(id) {
        const count = await prisma.question.count({
            where: {
                categoryId: id,
                deletedAt: null,
            },
        });
        return count > 0;
    }
    static async countQuestionCategories(filters) {
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
    static async getAllQueCategories(filters, pagination) {
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
    static async findQuestionTagByName(name) {
        return await prisma.questionTag.findUnique({
            where: { name }
        });
    }
    static async findQuestionTagById(id) {
        return await prisma.questionTag.findUnique({
            where: { id }
        });
    }
    static async createQuestionTag(name) {
        return await prisma.questionTag.create({
            data: { name }
        });
    }
    static async updateQuestionTag(id, name) {
        return await prisma.questionTag.update({
            where: { id },
            data: { name }
        });
    }
    static async deleteQuestionTag(id) {
        return await prisma.questionTag.delete({
            where: { id }
        });
    }
    static async getTagUsageCount(id) {
        return await prisma.questionTagMap.count({
            where: { tagId: id }
        });
    }
    static async countQuestionTags(filters) {
        return await prisma.questionTag.count({
            where: {
                ...(filters.search && {
                    name: {
                        contains: filters.search,
                        mode: "insensitive"
                    }
                })
            }
        });
    }
    static async getAllQuestionTags(filters, pagination) {
        return await prisma.questionTag.findMany({
            where: {
                ...(filters.search && {
                    name: {
                        contains: filters.search,
                        mode: "insensitive"
                    }
                })
            },
            skip: pagination.skip,
            take: pagination.take,
            orderBy: {
                [pagination.sortBy]: pagination.sortOrder
            }
        });
    }
}
//# sourceMappingURL=question.repository.js.map