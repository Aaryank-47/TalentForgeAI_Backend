import prisma from "../../../config/database.js";
export class AssessmentBuilderRepository {
    static async createAssessment(data) {
        return await prisma.assessment.create({
            data
        });
    }
    static async findAssessmentById(id) {
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
                                fullName: true,
                                email: true,
                                profilePicture: true
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
    static async findAssessments(filters, pagination) {
        const where = this.buildWhereClause(filters);
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
    static async countAssessments(filters) {
        const where = this.buildWhereClause(filters);
        return await prisma.assessment.count({ where });
    }
    static async findAssessmentByTitleInCompany(title, companyId) {
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
    static async updateAssessment(id, data) {
        return await prisma.assessment.update({
            where: { id },
            data
        });
    }
    static async hasActiveAttempts(assessmentId) {
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
    static async isAssignedToJob(assessmentId) {
        const count = await prisma.jobAssessment.count({
            where: {
                assessmentId
            }
        });
        return count > 0;
    }
    static async softDeleteAssessment(id, deletedById) {
        return await prisma.assessment.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedById
            }
        });
    }
    static async duplicateAssessment(assessmentId, memberId) {
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
    static buildWhereClause(filters) {
        return {
            deletedAt: null,
            ...(filters.companyId && { companyId: filters.companyId }),
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
}
//# sourceMappingURL=assessmentBuilder.repository.js.map