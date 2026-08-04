import { CompanyRepository } from "../../company/repository/company.repository.js";
import { QuestionType, Prisma } from "@prisma/client";
import { AssessmentBuilderRepository } from "../repositories/assessmentBuilder.repository.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { ForbiddenError } from "../../../common/errors/ForbiddenError.js";
import { PaginationHelper } from "../../../common/helper/pagination.helper.js";
import { removeUndefined } from "../../../common/helper/object.helper.js";
import type { AuthTokenPayload } from "../../auth/interfaces/auth.interface.js";
import type { SectionQuestionItemView } from "../interfaces/question.interface.js"
import type {
    CreateAssessmentDto,
    UpdateAssessmentDto,
    GetAssessmentsQueryDto,
    CreateAssessmentSectionDto,
    UpdateAssessmentSectionDto,
    ReorderSectionsDto,
    AddQuestionsToSectionDto,
    UpdateSectionItemDto,
    ReorderQuestionsDto
} from "../dto/assessmentBuilder.dto.js";
import { QuestionRepository } from "../repositories/question.repository.js";



export class AssessmentBuilderService {
    static async createAssessment(dto: CreateAssessmentDto, memberId: string) {
        const company = await CompanyRepository.findCompanyById(dto.companyId);
        if (!company) {
            throw new NotFoundError("Company not found");
        }

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

    static async getAssessments(filters: GetAssessmentsQueryDto, user: AuthTokenPayload) {
        let companyIds: string[] | undefined;

        if (user.role === "EMPLOYER") {
            if (filters.companyId) {
                const member = await CompanyRepository.findMemberByUserAndCompany(user.id, filters.companyId);
                if (!member) {
                    throw new ForbiddenError("You do not belong to this company.");
                }
            } else {
                const memberships = await CompanyRepository.findActiveMembershipsByUser(user.id);
                companyIds = memberships.map(m => m.companyId);
                if (companyIds.length === 0) {
                    return PaginationHelper.buildResponse([], PaginationHelper.getPagination(filters), 0);
                }
            }
        }

        const pagination = PaginationHelper.getPagination(filters);
        const items = await AssessmentBuilderRepository.findAssessments(filters, pagination, companyIds);
        const total = await AssessmentBuilderRepository.countAssessments(filters, companyIds);

        return PaginationHelper.buildResponse(items, pagination, total);
    }

    static async getAssessmentById(assessmentId: string) {
        const assessment = await AssessmentBuilderRepository.findAssessmentById(assessmentId);
        if (!assessment) {
            throw new NotFoundError("Assessment not found");
        }

        return {
            success: true,
            data: assessment
        };
    }

    static async updateAssessment(assessmentId: string, dto: UpdateAssessmentDto, memberId: string) {
        const assessment = await AssessmentBuilderRepository.findAssessmentById(assessmentId);
        if (!assessment) {
            throw new NotFoundError("Assessment not found");
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

        const updateData: any = {};
        if (dto.title !== undefined) updateData.title = dto.title;
        if (dto.description !== undefined) updateData.description = dto.description;
        if (dto.instructions !== undefined) updateData.instructions = dto.instructions;
        if (dto.durationMinutes !== undefined) updateData.durationMinutes = dto.durationMinutes;
        if (dto.passingScore !== undefined) updateData.passingScore = dto.passingScore;
        if (dto.totalMarks !== undefined) updateData.totalMarks = dto.totalMarks;
        if (dto.isTemplate !== undefined) updateData.isTemplate = dto.isTemplate;
        updateData.updatedById = memberId;

        await AssessmentBuilderRepository.updateAssessment(assessmentId, updateData);

        return {
            success: true,
            message: "Assessment updated successfully."
        };
    }

    static async deleteAssessment(assessmentId: string, memberId: string) {
        const assessment = await AssessmentBuilderRepository.findAssessmentById(assessmentId);
        if (!assessment) {
            throw new NotFoundError("Assessment not found");
        }

        const assignedToJob = await AssessmentBuilderRepository.isAssignedToJob(assessmentId);
        if (assignedToJob) {
            throw new ConflictError("Cannot delete assessment because it is assigned to a Job.");
        }
        const hasActiveAttempts = await AssessmentBuilderRepository.hasActiveAttempts(assessmentId);
        if (hasActiveAttempts) {
            throw new ConflictError("Cannot delete assessment because active candidate attempts exist.");
        }

        await AssessmentBuilderRepository.softDeleteAssessment(assessmentId, memberId);

        return {
            success: true,
            message: "Assessment deleted successfully."
        };
    }

    static async publishAssessment(assessmentId: string, memberId: string) {
        const assessment = await AssessmentBuilderRepository.findAssessmentById(assessmentId);
        if (!assessment) {
            throw new NotFoundError("Assessment not found");
        }

        if (assessment.status === "PUBLISHED") {
            throw new ConflictError("Assessment is already published.");
        }

        if (assessment.status === "ARCHIVED") {
            throw new ConflictError("Cannot publish an archived assessment.");
        }

        if (assessment.sections.length === 0) {
            throw new ConflictError("Cannot publish an incomplete assessment: At least one section is required.");
        }

        let totalQuestions = 0;
        for (const sec of assessment.sections) {
            totalQuestions += sec.items.length;
        }

        if (totalQuestions === 0) {
            throw new ConflictError("Cannot publish an incomplete assessment: At least one question is required.");
        }

        if (!assessment.totalMarks || assessment.totalMarks <= 0) {
            throw new ConflictError("Cannot publish an incomplete assessment: Total marks must be greater than 0.");
        }

        if (!assessment.durationMinutes || assessment.durationMinutes <= 0) {
            throw new ConflictError("Cannot publish an incomplete assessment: Duration must be greater than 0.");
        }

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

    static async archiveAssessment(assessmentId: string, memberId: string) {
        const assessment = await AssessmentBuilderRepository.findAssessmentById(assessmentId);
        if (!assessment) {
            throw new NotFoundError("Assessment not found");
        }

        if (assessment.status === "ARCHIVED") {
            throw new ConflictError("Assessment is already archived.");
        }

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

    static async duplicateAssessment(assessmentId: string, memberId: string) {
        const assessment = await AssessmentBuilderRepository.findAssessmentById(assessmentId);
        if (!assessment) {
            throw new NotFoundError("Assessment not found");
        }

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

    static async createAssessmentSection(
        assessmentId: string,
        dto: CreateAssessmentSectionDto
    ): Promise<{
        id: string;
        title: string;
        sectionType: QuestionType;
        displayOrder: number;
    }> {
        const assessment = await AssessmentBuilderRepository.findAssessmentById(assessmentId);
        if (!assessment) {
            throw new NotFoundError("Assessment not found");
        }

        if (assessment.status === "ARCHIVED") {
            throw new ConflictError("Cannot edit an archived assessment.");
        }

        const existingSection = await AssessmentBuilderRepository.findSectionByTitle(assessmentId, dto.title);
        if (existingSection) {
            throw new ConflictError("Duplicate Section Title");
        }

        const maxOrder = await AssessmentBuilderRepository.getMaxDisplayOrder(assessmentId);
        const displayOrder = maxOrder + 1;

        const section = await AssessmentBuilderRepository.createSection({
            assessmentId,
            title: dto.title,
            description: dto.description || null,
            instructions: dto.instructions || null,
            sectionType: dto.sectionType,
            durationMinutes: dto.durationMinutes || null,
            displayOrder
        });

        return {
            id: section.id,
            title: section.title,
            sectionType: section.sectionType,
            displayOrder: section.displayOrder
        }
    }

    static async getAssessmentSections(assessmentId: string) {
        const assessment = await AssessmentBuilderRepository.findAssessmentById(assessmentId);
        if (!assessment) {
            throw new NotFoundError("Assessment not found");
        }

        const sections = await AssessmentBuilderRepository.findSectionsByAssessmentId(assessmentId);

        return sections.map((sec) => ({
            id: sec.id,
            title: sec.title,
            sectionType: sec.sectionType,
            durationMinutes: sec.durationMinutes,
            displayOrder: sec.displayOrder,
            questionCount: sec._count.items
        }));
    }

    static async updateAssessmentSection(sectionId: string, dto: UpdateAssessmentSectionDto) {
        const section = await AssessmentBuilderRepository.findSectionById(sectionId);
        if (!section) {
            throw new NotFoundError("Section not found");
        }

        if (section.assessment.status === "ARCHIVED") {
            throw new ConflictError("Cannot edit an archived assessment.");
        }

        const updateData: any = {};
        if (dto.title !== undefined) updateData.title = dto.title;
        if (dto.description !== undefined) updateData.description = dto.description;
        if (dto.instructions !== undefined) updateData.instructions = dto.instructions;
        if (dto.durationMinutes !== undefined) updateData.durationMinutes = dto.durationMinutes;

        await AssessmentBuilderRepository.updateSection(sectionId, updateData);

        return {
            success: true,
            message: "Section updated successfully."
        };
    }

    static async deleteAssessmentSection(sectionId: string) {
        const section = await AssessmentBuilderRepository.findSectionById(sectionId);
        if (!section) {
            throw new NotFoundError("Section not found");
        }

        if (section.assessment.status === "ARCHIVED") {
            throw new ConflictError("Cannot edit an archived assessment.");
        }

        const assessmentId = section.assessmentId;

        await AssessmentBuilderRepository.deleteSection(sectionId);
        await AssessmentBuilderRepository.recalculateDisplayOrder(assessmentId);

        return {
            success: true,
            message: "Section deleted successfully."
        };
    }

    static async reorderAssessmentSections(dto: ReorderSectionsDto) {
        const assessment = await AssessmentBuilderRepository.findAssessmentById(dto.assessmentId);
        if (!assessment) {
            throw new NotFoundError("Assessment not found");
        }

        if (assessment.status === "ARCHIVED") {
            throw new ConflictError("Cannot edit an archived assessment.");
        }

        // Verify that all sections in the payload belong to the assessment
        const existingSectionIds = assessment.sections.map((s) => s.id);
        const payloadSectionIds = dto.sections.map((s) => s.sectionId);

        const allExist = payloadSectionIds.every((id) => existingSectionIds.includes(id));
        if (!allExist) {
            throw new ConflictError("One or more sections do not belong to the assessment.");
        }

        await AssessmentBuilderRepository.reorderSections(dto.assessmentId, dto.sections);

        return {
            success: true,
            message: "Sections reordered successfully."
        };
    }

    static async addQuestionsToSection(
        sectionId: string,
        questions: AddQuestionsToSectionDto["questions"]
    ): Promise<any> {
        const section = await AssessmentBuilderRepository.findSectionById(sectionId);
        if (!section) {
            throw new NotFoundError("Section not found");
        }
        if (section.assessment.status !== "DRAFT") {
            throw new ConflictError("Cannot add questions to an assessment that is not in DRAFT status.");
        }

        const addedItems = await AssessmentBuilderRepository.addQuestionsToSection(
            sectionId,
            section.assessment.companyId,
            section.sectionType,
            questions.map(q => ({
                questionId: q.questionId,
                marksOverride: q.marksOverride ?? null,
                timeLimitOverride: q.timeLimitOverride ?? null
            }))
        );

        return {
            data: addedItems
        };
    }

    static async getSectionQuestions(
        sectionId: string,
        companyId: string
    ): Promise<SectionQuestionItemView[]> {
        const section = await AssessmentBuilderRepository.findSectionById(sectionId);
        if (!section) {
            throw new NotFoundError("Section not found");
        }

        if (section.assessment.companyId !== companyId) {
            throw new ForbiddenError("You do not have permission to access this section.");
        }

        const items = await AssessmentBuilderRepository.findSectionItems(sectionId);

        return items.map(item => ({
            sectionItemId: item.id,
            displayOrder: item.displayOrder,
            marksOverride: item.marksOverride,
            timeLimitOverride: item.timeLimitOverride,
            question: {
                id: item.question.id,
                title: item.question.title,
                difficulty: item.question.difficulty,
                defaultMarks: item.question.defaultMarks
            }
        }));
    }

    static async updateSectionItem(
        sectionItemId: string,
        dto: UpdateSectionItemDto,
        companyId: string
    ): Promise<void> {
        const item = await AssessmentBuilderRepository.findSectionItemById(sectionItemId);
        if (!item) {
            throw new NotFoundError("Section item not found");
        }

        if (item.section.assessment.companyId !== companyId) {
            throw new ForbiddenError("You do not have permission to access this section item.");
        }

        if (item.section.assessment.status !== "DRAFT") {
            throw new ConflictError("Cannot update section items in a non-draft assessment.");
        }

        const updateData = removeUndefined({
            marksOverride: dto.marksOverride,
            timeLimitOverride: dto.timeLimitOverride,
            isRequired: dto.isRequired
        }) as Prisma.AssessmentSectionItemUncheckedUpdateInput;

        await AssessmentBuilderRepository.updateSectionItem(sectionItemId, updateData);
    }

    static async removeQuestionFromSection(
        sectionItemId: string,
        companyId: string
    ): Promise<void> {
        const item = await AssessmentBuilderRepository.findSectionItemById(sectionItemId);
        if (!item) {
            throw new NotFoundError("Section item not found");
        }

        if (item.section.assessment.companyId !== companyId) {
            throw new ForbiddenError("You do not have permission to access this section item.");
        }

        if (item.section.assessment.status !== "DRAFT") {
            throw new ConflictError("Cannot remove section items from a non-draft assessment.");
        }

        const sectionId = item.sectionId;

        await AssessmentBuilderRepository.deleteSectionItem(sectionItemId);
        await AssessmentBuilderRepository.recalculateItemsDisplayOrder(sectionId);
    }

    static async reorderQuestions(
        dto: ReorderQuestionsDto,
        companyId: string
    ): Promise<void> {
        const section = await AssessmentBuilderRepository.findSectionById(dto.sectionId);
        if (!section) {
            throw new NotFoundError("Section not found");
        }

        if (section.assessment.companyId !== companyId) {
            throw new ForbiddenError("You do not have permission to access this section.");
        }

        if (section.assessment.status !== "DRAFT") {
            throw new ConflictError("Cannot reorder section items in a non-draft assessment.");
        }

        const existingItems = await AssessmentBuilderRepository.findSectionItems(dto.sectionId);
        const existingItemIds = existingItems.map(i => i.id);
        const payloadItemIds = dto.items.map(i => i.sectionItemId);

        const allExist = payloadItemIds.every(id => existingItemIds.includes(id));
        if (!allExist) {
            throw new ConflictError("One or more section items do not belong to the section.");
        }

        await AssessmentBuilderRepository.reorderSectionItems(dto.sectionId, dto.items);
    }
}




