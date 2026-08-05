import prisma from "../../../config/database.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { CompanyMemberStatus, QuestionType } from "@prisma/client";
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
    static async findQuestionCategoryByIds(ids) {
        return await prisma.questionCategory.findMany({
            where: {
                id: { in: ids },
                deletedAt: null
            }
        });
    }
    static async findValidQuestions(questionIds, companyId, sectionTypes) {
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
    // Question Bank operations
    static async findQuestionById(id) {
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
    static async createQuestion(dto, createdById, createdByCompanyMemberId) {
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
                    data: dto.tagIds.map((tagId) => ({
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
                    data: dto.mcqDetail.options.map((opt) => ({
                        mcqDetailId: mcq.id,
                        optionText: opt.optionText,
                        displayOrder: opt.displayOrder,
                        isCorrect: opt.isCorrect,
                    }))
                });
            }
            else if (dto.type === "DSA" && dto.dsaDetail) {
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
                        data: dto.dsaDetail.supportedLanguageIds.map((langId) => ({
                            dsaDetailId: dsa.id,
                            programmingLanguageId: langId
                        }))
                    });
                }
                if (dto.dsaDetail.testCases.length > 0) {
                    await tx.testCase.createMany({
                        data: dto.dsaDetail.testCases.map((tc) => ({
                            dsaDetailId: dsa.id,
                            input: tc.input,
                            expectedOutput: tc.expectedOutput,
                            type: tc.type || "SAMPLE",
                            explanation: tc.explanation || null,
                            displayOrder: tc.displayOrder,
                        }))
                    });
                }
            }
            else if (dto.type === "MACHINE_CODING" && dto.machineCodingDetail) {
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
            }
            else if (dto.type === "PROJECT" && dto.projectDetail) {
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
    static async updateQuestion(id, dto, updatedById) {
        return await prisma.$transaction(async (tx) => {
            const current = await tx.question.findUnique({
                where: { id }
            });
            if (!current)
                throw new NotFoundError("Question not found");
            const updateData = {
                updatedById,
                version: { increment: 1 }
            };
            if (dto.title !== undefined)
                updateData.title = dto.title;
            if (dto.description !== undefined)
                updateData.description = dto.description;
            if (dto.difficulty !== undefined)
                updateData.difficulty = dto.difficulty;
            if (dto.estimatedTime !== undefined)
                updateData.estimatedTime = dto.estimatedTime;
            if (dto.defaultMarks !== undefined)
                updateData.defaultMarks = dto.defaultMarks;
            if (dto.categoryId !== undefined)
                updateData.categoryId = dto.categoryId;
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
                        data: dto.tagIds.map((tagId) => ({
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
                    data: dto.mcqDetail.options.map((opt) => ({
                        mcqDetailId: mcq.id,
                        optionText: opt.optionText,
                        displayOrder: opt.displayOrder,
                        isCorrect: opt.isCorrect,
                    }))
                });
            }
            else if (question.type === "DSA" && dto.dsaDetail) {
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
                        data: dto.dsaDetail.supportedLanguageIds.map((langId) => ({
                            dsaDetailId: dsa.id,
                            programmingLanguageId: langId
                        }))
                    });
                }
                if (dto.dsaDetail.testCases.length > 0) {
                    await tx.testCase.createMany({
                        data: dto.dsaDetail.testCases.map((tc) => ({
                            dsaDetailId: dsa.id,
                            input: tc.input,
                            expectedOutput: tc.expectedOutput,
                            type: tc.type || "SAMPLE",
                            explanation: tc.explanation || null,
                            displayOrder: tc.displayOrder,
                        }))
                    });
                }
            }
            else if (question.type === "MACHINE_CODING" && dto.machineCodingDetail) {
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
            }
            else if (question.type === "PROJECT" && dto.projectDetail) {
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
    static async softDeleteQuestion(id, deletedById) {
        return await prisma.question.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedById
            }
        });
    }
    static async countQuestions(filters) {
        const whereClause = this.buildQuestionsWhereClause(filters);
        return await prisma.question.count({
            where: whereClause
        });
    }
    static async getAllQuestions(filters, pagination) {
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
    static async publishQuestion(id, publishedById) {
        return await prisma.question.update({
            where: { id },
            data: {
                status: "PUBLISHED",
                publishedAt: new Date(),
                publishedById
            }
        });
    }
    static async archiveQuestion(id, archivedById) {
        return await prisma.question.update({
            where: { id },
            data: {
                status: "ARCHIVED",
                archivedAt: new Date(),
                archivedById
            }
        });
    }
    static async findCompanyMember(userId, companyId) {
        return await prisma.companyMember.findFirst({
            where: {
                userId,
                companyId,
                status: CompanyMemberStatus.ACTIVE
            }
        });
    }
    static buildQuestionsWhereClause(filters) {
        const tagIdsArray = filters.tagIds ? filters.tagIds.split(",") : [];
        return {
            deletedAt: null,
            ...(filters.type && { type: filters.type }),
            ...(filters.difficulty && { difficulty: filters.difficulty }),
            ...(filters.status && { status: filters.status }),
            ...(filters.ownership && { ownership: filters.ownership }),
            ...(filters.companyId && { companyId: filters.companyId }),
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
    }
}
//# sourceMappingURL=question.repository.js.map