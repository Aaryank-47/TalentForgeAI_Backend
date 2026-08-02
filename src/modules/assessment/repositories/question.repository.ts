import prisma from "../../../config/database.js";
import type { QuestionCategory, QuestionTag, ProgrammingLanguage, DSASupportedLanguage } from "@prisma/client";
import type { GetQuestionCategoriesDto, GetQuestionTagsDto, GetProgrammingLanguagesDto } from "../dto/question.dto.js";
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

    static async findQuestionTagByName(name: string): Promise<QuestionTag | null> {
        return await prisma.questionTag.findUnique({
            where: { name }
        });
    }

    static async findQuestionTagById(id: string): Promise<QuestionTag | null> {
        return await prisma.questionTag.findUnique({
            where: { id }
        });
    }

    static async createQuestionTag(name: string): Promise<QuestionTag> {
        return await prisma.questionTag.create({
            data: { name }
        });
    }

    static async updateQuestionTag(id: string, name: string): Promise<QuestionTag> {
        return await prisma.questionTag.update({
            where: { id },
            data: { name }
        });
    }

    static async deleteQuestionTag(id: string): Promise<QuestionTag> {
        return await prisma.questionTag.delete({
            where: { id }
        });
    }

    static async getTagUsageCount(id: string): Promise<number> {
        return await prisma.questionTagMap.count({
            where: { tagId: id }
        });
    }

    static async countQuestionTags(filters: GetQuestionTagsDto): Promise<number> {
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

    static async getAllQuestionTags(
        filters: GetQuestionTagsDto,
        pagination: PaginationResult
    ): Promise<QuestionTag[]> {
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
    static async findLanguageByName(
        name: string
    ): Promise<ProgrammingLanguage | null> {
        return await prisma.programmingLanguage.findUnique({
            where: { name }
        });
    }

    static async findLanguageBySlug(
        slug: string
    ): Promise<ProgrammingLanguage | null> {
        return await prisma.programmingLanguage.findUnique({
            where: { slug }
        });
    }

    static async findLanguageById(id: string): Promise<ProgrammingLanguage | null> {
        return await prisma.programmingLanguage.findUnique({
            where: { id }
        });
    }

    static async createLanguage(
        data: {
            name: string;
            slug: string;
            isActive?: boolean
        }
    ): Promise<ProgrammingLanguage> {
        return await prisma.programmingLanguage.create({
            data
        });
    }

    static async updateLanguage(
        id: string,
        data: {
            name?: string | undefined;
            slug?: string | undefined;
            isActive?: boolean | undefined
        }
    ): Promise<ProgrammingLanguage> {
        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.slug !== undefined) updateData.slug = data.slug;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        return await prisma.programmingLanguage.update({
            where: { id },
            data: updateData
        });
    }

    static async deleteLanguage(
        id: string
    ): Promise<ProgrammingLanguage> {
        return await prisma.programmingLanguage.delete({
            where: { id }
        });
    }

    static async getLanguageUsageCount(
        id: string
    ): Promise<number> {
        return await prisma.dSASupportedLanguage.count({
            where: { programmingLanguageId: id }
        });
    }

    static async countLanguages(
        filters: GetProgrammingLanguagesDto
    ): Promise<number> {
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

    static async getAllLanguages(
        filters: GetProgrammingLanguagesDto,
        pagination: PaginationResult
    ): Promise<ProgrammingLanguage[]> {
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
    static async createSupportedLanguages(
        dsaDetailId: string, 
        programmingLanguageIds: string[]
    ): Promise<any> {
        const data = programmingLanguageIds.map(id => ({
            dsaDetailId,
            programmingLanguageId: id
        }));
        return await prisma.dSASupportedLanguage.createMany({
            data,
            skipDuplicates: true
        });
    }

    static async syncSupportedLanguages(dsaDetailId: string, programmingLanguageIds: string[]): Promise<any> {
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

    static async deleteSupportedLanguages(dsaDetailId: string, programmingLanguageIds: string[]): Promise<any> {
        return await prisma.dSASupportedLanguage.deleteMany({
            where: {
                dsaDetailId,
                programmingLanguageId: {
                    in: programmingLanguageIds
                }
            }
        });
    }

    static async getSupportedLanguagesByDsaId(dsaDetailId: string) {
        return await prisma.dSASupportedLanguage.findMany({
            where: { dsaDetailId },
            include: {
                programmingLanguage: true
            }
        });
    }

    // Helper to find DSADetail by id (to verify existence)
    static async findDsaDetailById(id: string) {
        return await prisma.dSADetail.findUnique({
            where: { id }
        });
    }

    static async getCategoriesByParent(parentId: string | null): Promise<QuestionCategory[]> {
        return await prisma.questionCategory.findMany({
            where: {
                parentId,
                deletedAt: null
            }
        });
    }

    static async getAllTagsRaw(): Promise<QuestionTag[]> {
        return await prisma.questionTag.findMany();
    }

    static async getAllLanguagesRaw(): Promise<ProgrammingLanguage[]> {
        return await prisma.programmingLanguage.findMany();
    }
}
