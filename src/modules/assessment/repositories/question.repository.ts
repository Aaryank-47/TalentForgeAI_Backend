import prisma from "../../../config/database.js";
import type { Question, QuestionCategory, QuestionTag, ProgrammingLanguage } from "@prisma/client";
import type {
    GetQuestionCategoriesDto,
    GetQuestionTagsDto,
    GetProgrammingLanguagesDto,
    CreateQuestionDto,
    UpdateQuestionDto,
    GetQuestionsQueryDto
} from "../dto/question.dto.js";
import type { PaginationResult } from "../../../common/types/pagination.types.js";
import type { QuestionWithRelations } from "../interfaces/question.interface.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { CompanyMemberStatus, QuestionType } from "@prisma/client";

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

    static async findQuestionCategoryByIds(
        ids: string[]
    ): Promise<QuestionCategory[]> {
        return await prisma.questionCategory.findMany({
            where: {
                id: { in: ids },
                deletedAt: null
            }
        });
    }

    static async findValidQuestions(
        questionIds: string[],
        companyId: string,
        sectionTypes: QuestionType
    ): Promise<
        Pick<Question, "id">[]
    > {
        return await prisma.question.findMany({
            where: {
                id: { in: questionIds },
                deletedAt: null,
                archivedAt: null,
                type: sectionTypes,
                OR: [{
                    ownership: "GLOBAL"
                },
                {
                    ownership: "COMPANY",
                    companyId: companyId
                }],
            },
            select: {
                id: true
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
    ): Promise<{ count: number }> {
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

    static async deleteSupportedLanguages(dsaDetailId: string, programmingLanguageIds: string[]): Promise<{ count: number }> {
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

    // Question Bank operations
    static async findQuestionById(id: string): Promise<QuestionWithRelations | null> {
        return await prisma.question.findFirst({
            where: { id, deletedAt: null },
            include: {
                category: true,
                tags: {
                    include: { tag: true }
                },
                mcqDetail: {
                    include: { options: true }
                },
                dsaDetail: {
                    include: {
                        supportedLanguages: {
                            include: { programmingLanguage: true }
                        },
                        testCases: true
                    }
                },
                machineCodingDetail: true,
                projectDetail: true,
                createdBy: true,
                updatedBy: true,
                publishedBy: true,
                archivedBy: true,
                deletedBy: true,
            }
        });
    }

    static async createQuestion(
        dto: CreateQuestionDto,
        createdById: string | null,
        createdByCompanyMemberId: string | null
    ): Promise<Question> {
        return await prisma.$transaction(async (tx) => {
            const question = await tx.question.create({
                data: {
                    title: dto.title,
                    description: dto.description,
                    type: dto.type,
                    difficulty: dto.difficulty,
                    estimatedTime: dto.estimatedTime,
                    defaultMarks: dto.defaultMarks,
                    ownership: dto.ownership,
                    categoryId: dto.categoryId || null,
                    companyId: dto.companyId || null,
                    createdById,
                    createdByCompanyMemberId,
                    status: "DRAFT",
                    version: 1,
                }
            });

            if (dto.tagIds && dto.tagIds.length > 0) {
                await tx.questionTagMap.createMany({
                    data: dto.tagIds.map((tagId: string) => ({
                        questionId: question.id,
                        tagId
                    }))
                });
            }

            if (dto.type === "MCQ" && dto.mcqDetail) {
                const mcq = await tx.mCQDetail.create({
                    data: {
                        questionId: question.id,
                        allowMultipleCorrectAnswers: dto.mcqDetail.allowMultipleCorrectAnswers,
                        negativeMarks: dto.mcqDetail.negativeMarks,
                    }
                });
                await tx.mCQOption.createMany({
                    data: dto.mcqDetail.options.map((opt: any) => ({
                        mcqDetailId: mcq.id,
                        optionText: opt.optionText,
                        displayOrder: opt.displayOrder,
                        isCorrect: opt.isCorrect,
                    }))
                });
            } else if (dto.type === "DSA" && dto.dsaDetail) {
                const dsa = await tx.dSADetail.create({
                    data: {
                        questionId: question.id,
                        starterCode: dto.dsaDetail.starterCode,
                        referenceSolution: dto.dsaDetail.referenceSolution,
                        memoryLimit: dto.dsaDetail.memoryLimit,
                        timeLimit: dto.dsaDetail.timeLimit,
                    }
                });

                if (dto.dsaDetail.supportedLanguageIds.length > 0) {
                    await tx.dSASupportedLanguage.createMany({
                        data: dto.dsaDetail.supportedLanguageIds.map((langId: string) => ({
                            dsaDetailId: dsa.id,
                            programmingLanguageId: langId
                        }))
                    });
                }

                if (dto.dsaDetail.testCases.length > 0) {
                    await tx.testCase.createMany({
                        data: dto.dsaDetail.testCases.map((tc: any) => ({
                            dsaDetailId: dsa.id,
                            input: tc.input,
                            expectedOutput: tc.expectedOutput,
                            type: tc.type || "SAMPLE",
                            explanation: tc.explanation || null,
                            displayOrder: tc.displayOrder,
                        }))
                    });
                }
            } else if (dto.type === "MACHINE_CODING" && dto.machineCodingDetail) {
                await tx.machineCodingDetail.create({
                    data: {
                        questionId: question.id,
                        repositoryTemplate: dto.machineCodingDetail.repositoryTemplate || null,
                        projectStructure: dto.machineCodingDetail.projectStructure || null,
                        techStack: dto.machineCodingDetail.techStack || null,
                        implementationInstructions: dto.machineCodingDetail.implementationInstructions,
                        evaluationGuidelines: dto.machineCodingDetail.evaluationGuidelines || null,
                    }
                });
            } else if (dto.type === "PROJECT" && dto.projectDetail) {
                await tx.projectDetail.create({
                    data: {
                        questionId: question.id,
                        requirements: dto.projectDetail.requirements,
                        submissionInstructions: dto.projectDetail.submissionInstructions,
                        deadlineHours: dto.projectDetail.deadlineHours,
                    }
                });
            }

            return question;
        });
    }

    static async updateQuestion(
        id: string,
        dto: UpdateQuestionDto,
        updatedById: string | null
    ): Promise<Question> {
        return await prisma.$transaction(async (tx) => {
            const current = await tx.question.findUnique({
                where: { id }
            });
            if (!current) throw new NotFoundError("Question not found");

            const updateData: any = {
                updatedById,
                version: { increment: 1 }
            };
            if (dto.title !== undefined) updateData.title = dto.title;
            if (dto.description !== undefined) updateData.description = dto.description;
            if (dto.difficulty !== undefined) updateData.difficulty = dto.difficulty;
            if (dto.estimatedTime !== undefined) updateData.estimatedTime = dto.estimatedTime;
            if (dto.defaultMarks !== undefined) updateData.defaultMarks = dto.defaultMarks;
            if (dto.categoryId !== undefined) updateData.categoryId = dto.categoryId;

            const question = await tx.question.update({
                where: { id },
                data: updateData
            });

            if (dto.tagIds !== undefined) {
                await tx.questionTagMap.deleteMany({
                    where: { questionId: id }
                });
                if (dto.tagIds.length > 0) {
                    await tx.questionTagMap.createMany({
                        data: dto.tagIds.map((tagId: string) => ({
                            questionId: id,
                            tagId
                        }))
                    });
                }
            }

            if (question.type === "MCQ" && dto.mcqDetail) {
                await tx.mCQOption.deleteMany({
                    where: { mcqDetail: { questionId: id } }
                });
                await tx.mCQDetail.deleteMany({
                    where: { questionId: id }
                });

                const mcq = await tx.mCQDetail.create({
                    data: {
                        questionId: id,
                        allowMultipleCorrectAnswers: dto.mcqDetail.allowMultipleCorrectAnswers,
                        negativeMarks: dto.mcqDetail.negativeMarks,
                    }
                });
                await tx.mCQOption.createMany({
                    data: dto.mcqDetail.options.map((opt: any) => ({
                        mcqDetailId: mcq.id,
                        optionText: opt.optionText,
                        displayOrder: opt.displayOrder,
                        isCorrect: opt.isCorrect,
                    }))
                });
            } else if (question.type === "DSA" && dto.dsaDetail) {
                await tx.testCase.deleteMany({
                    where: { dsaDetail: { questionId: id } }
                });
                await tx.dSASupportedLanguage.deleteMany({
                    where: { dsaDetail: { questionId: id } }
                });
                await tx.dSADetail.deleteMany({
                    where: { questionId: id }
                });

                const dsa = await tx.dSADetail.create({
                    data: {
                        questionId: id,
                        starterCode: dto.dsaDetail.starterCode,
                        referenceSolution: dto.dsaDetail.referenceSolution,
                        memoryLimit: dto.dsaDetail.memoryLimit,
                        timeLimit: dto.dsaDetail.timeLimit,
                    }
                });
                if (dto.dsaDetail.supportedLanguageIds.length > 0) {
                    await tx.dSASupportedLanguage.createMany({
                        data: dto.dsaDetail.supportedLanguageIds.map((langId: string) => ({
                            dsaDetailId: dsa.id,
                            programmingLanguageId: langId
                        }))
                    });
                }
                if (dto.dsaDetail.testCases.length > 0) {
                    await tx.testCase.createMany({
                        data: dto.dsaDetail.testCases.map((tc: any) => ({
                            dsaDetailId: dsa.id,
                            input: tc.input,
                            expectedOutput: tc.expectedOutput,
                            type: tc.type || "SAMPLE",
                            explanation: tc.explanation || null,
                            displayOrder: tc.displayOrder,
                        }))
                    });
                }
            } else if (question.type === "MACHINE_CODING" && dto.machineCodingDetail) {
                await tx.machineCodingDetail.deleteMany({
                    where: { questionId: id }
                });
                await tx.machineCodingDetail.create({
                    data: {
                        questionId: id,
                        repositoryTemplate: dto.machineCodingDetail.repositoryTemplate || null,
                        projectStructure: dto.machineCodingDetail.projectStructure || null,
                        techStack: dto.machineCodingDetail.techStack || null,
                        implementationInstructions: dto.machineCodingDetail.implementationInstructions,
                        evaluationGuidelines: dto.machineCodingDetail.evaluationGuidelines || null,
                    }
                });
            } else if (question.type === "PROJECT" && dto.projectDetail) {
                await tx.projectDetail.deleteMany({
                    where: { questionId: id }
                });
                await tx.projectDetail.create({
                    data: {
                        questionId: id,
                        requirements: dto.projectDetail.requirements,
                        submissionInstructions: dto.projectDetail.submissionInstructions,
                        deadlineHours: dto.projectDetail.deadlineHours,
                    }
                });
            }

            return question;
        });
    }

    static async softDeleteQuestion(id: string, deletedById: string): Promise<Question> {
        return await prisma.question.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedById
            }
        });
    }

    static async countQuestions(filters: GetQuestionsQueryDto): Promise<number> {
        const whereClause = this.buildQuestionsWhereClause(filters);
        return await prisma.question.count({
            where: whereClause
        });
    }

    static async getAllQuestions(filters: GetQuestionsQueryDto, pagination: PaginationResult): Promise<QuestionWithRelations[]> {
        const whereClause = this.buildQuestionsWhereClause(filters);
        return await prisma.question.findMany({
            where: whereClause,
            skip: pagination.skip,
            take: pagination.take,
            orderBy: {
                [pagination.sortBy]: pagination.sortOrder
            },
            include: {
                category: true,
                tags: {
                    include: { tag: true }
                },
                mcqDetail: {
                    include: { options: true }
                },
                dsaDetail: {
                    include: {
                        supportedLanguages: {
                            include: { programmingLanguage: true }
                        },
                        testCases: true
                    }
                },
                machineCodingDetail: true,
                projectDetail: true,
            }
        });
    }

    static async publishQuestion(id: string, publishedById: string): Promise<Question> {
        return await prisma.question.update({
            where: { id },
            data: {
                status: "PUBLISHED",
                publishedAt: new Date(),
                publishedById
            }
        });
    }

    static async archiveQuestion(id: string, archivedById: string): Promise<Question> {
        return await prisma.question.update({
            where: { id },
            data: {
                status: "ARCHIVED",
                archivedAt: new Date(),
                archivedById
            }
        });
    }

    static async findCompanyMember(
        userId: string,
        companyId: string
    ) {
        return await prisma.companyMember.findFirst({
            where: {
                userId,
                companyId,
                status: CompanyMemberStatus.ACTIVE
            }
        });
    }

    static async removeTagFromQuestion(questionId: string, tagId: string): Promise<void> {
        await prisma.questionTagMap.deleteMany({
            where: {
                questionId,
                tagId
            }
        });
    }

    private static buildQuestionsWhereClause(filters: GetQuestionsQueryDto): any {
        const tagIdsArray = filters.tagIds ? filters.tagIds.split(",") : [];

        const where: any = {
            deletedAt: null,
            ...(filters.type && { type: filters.type }),
            ...(filters.difficulty && { difficulty: filters.difficulty }),
            ...(filters.status && { status: filters.status }),
            ...(filters.categoryId && { categoryId: filters.categoryId }),
            ...(tagIdsArray.length > 0 && {
                tags: {
                    some: {
                        tagId: { in: tagIdsArray }
                    }
                }
            }),
            ...(filters.search && {
                OR: [
                    { title: { contains: filters.search, mode: "insensitive" } },
                    { description: { contains: filters.search, mode: "insensitive" } }
                ]
            })
        };

        if (filters.companyId) {
            if (filters.ownership === "COMPANY") {
                where.ownership = "COMPANY";
                where.companyId = filters.companyId;
            } else if (filters.ownership === "GLOBAL") {
                where.ownership = "GLOBAL";
            } else {
                where.OR = [
                    ...(where.OR ? [{ OR: where.OR }] : []),
                    { ownership: "GLOBAL" },
                    { ownership: "COMPANY", companyId: filters.companyId }
                ];
            }
        } else if (filters.ownership) {
            where.ownership = filters.ownership;
        }

        return where;
    }
}
