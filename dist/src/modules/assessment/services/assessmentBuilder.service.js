import prisma from "../../../config/database.js";
import { CompanyRepository } from "../../company/repository/company.repository.js";
import { AssessmentBuilderRepository } from "../repositories/assessmentBuilder.repository.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { ForbiddenError } from "../../../common/errors/ForbiddenError.js";
import { PaginationHelper } from "../../../common/helper/pagination.helper.js";
export class AssessmentBuilderService {
    static async getOrCreateCompanyMember(userId, companyId, role) {
        const member = await CompanyRepository.findMemberByUserAndCompany(userId, companyId);
        if (member) {
            return member.id;
        }
        if (role === "ADMIN" || role === "SUPER_ADMIN") {
            const newMember = await prisma.companyMember.create({
                data: {
                    userId,
                    companyId,
                    role: "ADMIN",
                    status: "ACTIVE"
                }
            });
            return newMember.id;
        }
        throw new ForbiddenError("You must belong to this company to perform this action.");
    }
    static async createAssessment(dto, user) {
        const company = await CompanyRepository.findCompanyById(dto.companyId);
        if (!company) {
            throw new NotFoundError("Company not found");
        }
        const memberId = await this.getOrCreateCompanyMember(user.id, dto.companyId, user.role);
        const existing = await AssessmentBuilderRepository.findAssessmentByTitleInCompany(dto.title, dto.companyId);
        if (existing) {
            throw new ConflictError("Assessment Title Already Exists");
        }
        const assessment = await AssessmentBuilderRepository.createAssessment({
            companyId: dto.companyId,
            title: dto.title,
            description: dto.description || null,
            instructions: dto.instructions || null,
            durationMinutes: dto.durationMinutes,
            passingScore: dto.passingScore,
            totalMarks: dto.totalMarks,
            isTemplate: dto.isTemplate,
            createdById: memberId,
            status: "DRAFT"
        });
        return {
            success: true,
            message: "Assessment created successfully.",
            data: {
                id: assessment.id,
                title: assessment.title,
                status: assessment.status,
                createdAt: assessment.createdAt
            }
        };
    }
    static async getAssessments(filters, user) {
        if (user.role === "EMPLOYER") {
            if (filters.companyId) {
                const member = await CompanyRepository.findMemberByUserAndCompany(user.id, filters.companyId);
                if (!member) {
                    throw new ForbiddenError("You do not belong to this company.");
                }
            }
            else {
                const memberships = await prisma.companyMember.findMany({
                    where: { userId: user.id, status: "ACTIVE" },
                    select: { companyId: true }
                });
                const companyIds = memberships.map(m => m.companyId);
                // If the employer belongs to no companies, return empty list
                if (companyIds.length === 0) {
                    return PaginationHelper.buildResponse([], PaginationHelper.getPagination(filters), 0);
                }
                // Fetch using modified query where companyId is in user's company list
                const pagination = PaginationHelper.getPagination(filters);
                const whereClause = {
                    deletedAt: null,
                    companyId: { in: companyIds },
                    ...(filters.status && { status: filters.status }),
                    ...(filters.isTemplate !== undefined && { isTemplate: filters.isTemplate }),
                    ...(filters.search && {
                        title: {
                            contains: filters.search,
                            mode: "insensitive"
                        }
                    })
                };
                const items = await prisma.assessment.findMany({
                    where: whereClause,
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
                const total = await prisma.assessment.count({ where: whereClause });
                return PaginationHelper.buildResponse(items, pagination, total);
            }
        }
        const pagination = PaginationHelper.getPagination(filters);
        const items = await AssessmentBuilderRepository.findAssessments(filters, pagination);
        const total = await AssessmentBuilderRepository.countAssessments(filters);
        return PaginationHelper.buildResponse(items, pagination, total);
    }
    static async getAssessmentById(assessmentId, user) {
        const assessment = await AssessmentBuilderRepository.findAssessmentById(assessmentId);
        if (!assessment) {
            throw new NotFoundError("Assessment not found");
        }
        if (user.role === "EMPLOYER") {
            const member = await CompanyRepository.findMemberByUserAndCompany(user.id, assessment.companyId);
            if (!member) {
                throw new ForbiddenError("You do not belong to the company that owns this assessment.");
            }
        }
        return {
            success: true,
            data: assessment
        };
    }
    static async updateAssessment(assessmentId, dto, user) {
        const assessment = await AssessmentBuilderRepository.findAssessmentById(assessmentId);
        if (!assessment) {
            throw new NotFoundError("Assessment not found");
        }
        if (user.role === "EMPLOYER") {
            const member = await CompanyRepository.findMemberByUserAndCompany(user.id, assessment.companyId);
            if (!member) {
                throw new ForbiddenError("You do not belong to the company that owns this assessment.");
            }
        }
        if (assessment.status === "ARCHIVED") {
            throw new ConflictError("Cannot edit an archived assessment.");
        }
        if (dto.title && dto.title.toLowerCase() !== assessment.title.toLowerCase()) {
            const existing = await AssessmentBuilderRepository.findAssessmentByTitleInCompany(dto.title, assessment.companyId);
            if (existing) {
                throw new ConflictError("Assessment Title Already Exists");
            }
        }
        const memberId = await this.getOrCreateCompanyMember(user.id, assessment.companyId, user.role);
        const updateData = {};
        if (dto.title !== undefined)
            updateData.title = dto.title;
        if (dto.description !== undefined)
            updateData.description = dto.description;
        if (dto.instructions !== undefined)
            updateData.instructions = dto.instructions;
        if (dto.durationMinutes !== undefined)
            updateData.durationMinutes = dto.durationMinutes;
        if (dto.passingScore !== undefined)
            updateData.passingScore = dto.passingScore;
        if (dto.totalMarks !== undefined)
            updateData.totalMarks = dto.totalMarks;
        if (dto.isTemplate !== undefined)
            updateData.isTemplate = dto.isTemplate;
        updateData.updatedById = memberId;
        await AssessmentBuilderRepository.updateAssessment(assessmentId, updateData);
        return {
            success: true,
            message: "Assessment updated successfully."
        };
    }
    static async deleteAssessment(assessmentId, user) {
        const assessment = await AssessmentBuilderRepository.findAssessmentById(assessmentId);
        if (!assessment) {
            throw new NotFoundError("Assessment not found");
        }
        if (user.role === "EMPLOYER") {
            const member = await CompanyRepository.findMemberByUserAndCompany(user.id, assessment.companyId);
            if (!member) {
                throw new ForbiddenError("You do not belong to the company that owns this assessment.");
            }
        }
        // Cannot delete if assigned to a job
        const assignedToJob = await AssessmentBuilderRepository.isAssignedToJob(assessmentId);
        if (assignedToJob) {
            throw new ConflictError("Cannot delete assessment because it is assigned to a Job.");
        }
        // Cannot delete if active candidate attempts exist
        const hasActiveAttempts = await AssessmentBuilderRepository.hasActiveAttempts(assessmentId);
        if (hasActiveAttempts) {
            throw new ConflictError("Cannot delete assessment because active candidate attempts exist.");
        }
        const memberId = await this.getOrCreateCompanyMember(user.id, assessment.companyId, user.role);
        await AssessmentBuilderRepository.softDeleteAssessment(assessmentId, memberId);
        return {
            success: true,
            message: "Assessment deleted successfully."
        };
    }
    static async publishAssessment(assessmentId, user) {
        const assessment = await AssessmentBuilderRepository.findAssessmentById(assessmentId);
        if (!assessment) {
            throw new NotFoundError("Assessment not found");
        }
        if (user.role === "EMPLOYER") {
            const member = await CompanyRepository.findMemberByUserAndCompany(user.id, assessment.companyId);
            if (!member) {
                throw new ForbiddenError("You do not belong to the company that owns this assessment.");
            }
        }
        if (assessment.status === "PUBLISHED") {
            throw new ConflictError("Assessment is already published.");
        }
        if (assessment.status === "ARCHIVED") {
            throw new ConflictError("Cannot publish an archived assessment.");
        }
        // Validation: Must have at least 1 section
        if (assessment.sections.length === 0) {
            throw new ConflictError("Cannot publish an incomplete assessment: At least one section is required.");
        }
        // Validation: Must have at least 1 question (section item)
        let totalQuestions = 0;
        for (const sec of assessment.sections) {
            totalQuestions += sec.items.length;
        }
        if (totalQuestions === 0) {
            throw new ConflictError("Cannot publish an incomplete assessment: At least one question is required.");
        }
        // Validation: Total marks > 0 and durationMinutes > 0
        if (!assessment.totalMarks || assessment.totalMarks <= 0) {
            throw new ConflictError("Cannot publish an incomplete assessment: Total marks must be greater than 0.");
        }
        if (!assessment.durationMinutes || assessment.durationMinutes <= 0) {
            throw new ConflictError("Cannot publish an incomplete assessment: Duration must be greater than 0.");
        }
        const memberId = await this.getOrCreateCompanyMember(user.id, assessment.companyId, user.role);
        await AssessmentBuilderRepository.updateAssessment(assessmentId, {
            status: "PUBLISHED",
            publishedAt: new Date(),
            updatedById: memberId
        });
        return {
            success: true,
            message: "Assessment published successfully."
        };
    }
    static async archiveAssessment(assessmentId, user) {
        const assessment = await AssessmentBuilderRepository.findAssessmentById(assessmentId);
        if (!assessment) {
            throw new NotFoundError("Assessment not found");
        }
        if (user.role === "EMPLOYER") {
            const member = await CompanyRepository.findMemberByUserAndCompany(user.id, assessment.companyId);
            if (!member) {
                throw new ForbiddenError("You do not belong to the company that owns this assessment.");
            }
        }
        if (assessment.status === "ARCHIVED") {
            throw new ConflictError("Assessment is already archived.");
        }
        const memberId = await this.getOrCreateCompanyMember(user.id, assessment.companyId, user.role);
        await AssessmentBuilderRepository.updateAssessment(assessmentId, {
            status: "ARCHIVED",
            archivedAt: new Date(),
            updatedById: memberId
        });
        return {
            success: true,
            message: "Assessment archived successfully."
        };
    }
    static async duplicateAssessment(assessmentId, user) {
        const assessment = await AssessmentBuilderRepository.findAssessmentById(assessmentId);
        if (!assessment) {
            throw new NotFoundError("Assessment not found");
        }
        if (user.role === "EMPLOYER") {
            const member = await CompanyRepository.findMemberByUserAndCompany(user.id, assessment.companyId);
            if (!member) {
                throw new ForbiddenError("You do not belong to the company that owns this assessment.");
            }
        }
        const memberId = await this.getOrCreateCompanyMember(user.id, assessment.companyId, user.role);
        const duplicated = await AssessmentBuilderRepository.duplicateAssessment(assessmentId, memberId);
        return {
            success: true,
            message: "Assessment duplicated successfully.",
            data: {
                id: duplicated.id,
                status: duplicated.status
            }
        };
    }
}
//# sourceMappingURL=assessmentBuilder.service.js.map