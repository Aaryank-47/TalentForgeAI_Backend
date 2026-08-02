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
    // ProgrammingLanguage
    static async findLanguageByName(name) {
        return await prisma.programmingLanguage.findUnique({
            where: { name }
        });
    }
    static async findLanguageBySlug(slug) {
        return await prisma.programmingLanguage.findUnique({
            where: { slug }
        });
    }
    static async findLanguageById(id) {
        return await prisma.programmingLanguage.findUnique({
            where: { id }
        });
    }
    static async createLanguage(data) {
        return await prisma.programmingLanguage.create({
            data
        });
    }
    static async updateLanguage(id, data) {
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.slug !== undefined)
            updateData.slug = data.slug;
        if (data.isActive !== undefined)
            updateData.isActive = data.isActive;
        return await prisma.programmingLanguage.update({
            where: { id },
            data: updateData
        });
    }
    static async deleteLanguage(id) {
        return await prisma.programmingLanguage.delete({
            where: { id }
        });
    }
    static async getLanguageUsageCount(id) {
        return await prisma.dSASupportedLanguage.count({
            where: { programmingLanguageId: id }
        });
    }
    static async countLanguages(filters) {
        return await prisma.programmingLanguage.count({
            where: {
                ...(filters.search && {
                    OR: [
                        { name: { contains: filters.search, mode: "insensitive" } },
                        { slug: { contains: filters.search, mode: "insensitive" } },
                    ]
                }),
                ...(filters.isActive !== undefined && { isActive: filters.isActive })
            }
        });
    }
    static async getAllLanguages(filters, pagination) {
        return await prisma.programmingLanguage.findMany({
            where: {
                ...(filters.search && {
                    OR: [
                        { name: { contains: filters.search, mode: "insensitive" } },
                        { slug: { contains: filters.search, mode: "insensitive" } },
                    ]
                }),
                ...(filters.isActive !== undefined && { isActive: filters.isActive })
            },
            skip: pagination.skip,
            take: pagination.take,
            orderBy: {
                [pagination.sortBy]: pagination.sortOrder
            }
        });
    }
    // DSASupportedLanguage
    static async createSupportedLanguages(dsaDetailId, programmingLanguageIds) {
        const data = programmingLanguageIds.map(id => ({
            dsaDetailId,
            programmingLanguageId: id
        }));
        return await prisma.dSASupportedLanguage.createMany({
            data,
            skipDuplicates: true
        });
    }
    static async syncSupportedLanguages(dsaDetailId, programmingLanguageIds) {
        return await prisma.$transaction([
            prisma.dSASupportedLanguage.deleteMany({
                where: { dsaDetailId }
            }),
            prisma.dSASupportedLanguage.createMany({
                data: programmingLanguageIds.map(id => ({
                    dsaDetailId,
                    programmingLanguageId: id
                }))
            })
        ]);
    }
    static async deleteSupportedLanguages(dsaDetailId, programmingLanguageIds) {
        return await prisma.dSASupportedLanguage.deleteMany({
            where: {
                dsaDetailId,
                programmingLanguageId: {
                    in: programmingLanguageIds
                }
            }
        });
    }
    static async getSupportedLanguagesByDsaId(dsaDetailId) {
        return await prisma.dSASupportedLanguage.findMany({
            where: { dsaDetailId },
            include: {
                programmingLanguage: true
            }
        });
    }
    // Helper to find DSADetail by id (to verify existence)
    static async findDsaDetailById(id) {
        return await prisma.dSADetail.findUnique({
            where: { id }
        });
    }
    static async getCategoriesByParent(parentId) {
        return await prisma.questionCategory.findMany({
            where: {
                parentId,
                deletedAt: null
            }
        });
    }
    static async getAllTagsRaw() {
        return await prisma.questionTag.findMany();
    }
    static async getAllLanguagesRaw() {
        return await prisma.programmingLanguage.findMany();
    }
}
//# sourceMappingURL=question.repository.js.map