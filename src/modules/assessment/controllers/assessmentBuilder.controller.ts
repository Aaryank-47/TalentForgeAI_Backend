import type { Request, Response } from "express";
import { AssessmentBuilderService } from "../services/assessmentBuilder.service.js";
import { asyncHandler } from "../../../common/helper/asyncHandler.js";
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import type {
    CreateAssessmentDto,
    UpdateAssessmentDto,
    GetAssessmentsQueryDto,
    AssessmentIdParamDto,
    CreateAssessmentSectionDto,
    UpdateAssessmentSectionDto,
    ReorderSectionsDto,
    SectionIdParamDto,
    AddQuestionsToSectionDto,
    UpdateSectionItemDto,
    SectionItemIdParamDto,
    ReorderQuestionsDto
} from "../dto/assessmentBuilder.dto.js";



export class AssessmentBuilderController {
    static createAssessment = asyncHandler(
        async (req: Request, res: Response) => {
            const dto = req.body as CreateAssessmentDto;
            const memberId = req.companyMember!.id;

            const result = await AssessmentBuilderService.createAssessment(dto, memberId);

            res.status(HTTP_STATUS.CREATED).json(result);
        }
    );

    static getAssessments = asyncHandler(
        async (req: Request, res: Response) => {
            const filters = req.query as unknown as GetAssessmentsQueryDto;
            const user = req.user;

            const result = await AssessmentBuilderService.getAssessments(filters, user);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: result
            });
        }
    );

    static getAssessmentById = asyncHandler(
        async (req: Request, res: Response) => {
            const { assessmentId } = req.params as unknown as AssessmentIdParamDto;

            const result = await AssessmentBuilderService.getAssessmentById(assessmentId);

            res.status(HTTP_STATUS.OK).json(result);
        }
    );

    static updateAssessment = asyncHandler(
        async (req: Request, res: Response) => {
            const { assessmentId } = req.params as unknown as AssessmentIdParamDto;
            const dto = req.body as UpdateAssessmentDto;
            const memberId = req.companyMember!.id;

            const result = await AssessmentBuilderService.updateAssessment(assessmentId, dto, memberId);

            res.status(HTTP_STATUS.OK).json(result);
        }
    );

    static deleteAssessment = asyncHandler(
        async (req: Request, res: Response) => {
            const { assessmentId } = req.params as unknown as AssessmentIdParamDto;
            const memberId = req.companyMember!.id;

            const result = await AssessmentBuilderService.deleteAssessment(assessmentId, memberId);

            res.status(HTTP_STATUS.OK).json(result);
        }
    );

    static publishAssessment = asyncHandler(
        async (req: Request, res: Response) => {
            const { assessmentId } = req.params as unknown as AssessmentIdParamDto;
            const memberId = req.companyMember!.id;

            const result = await AssessmentBuilderService.publishAssessment(assessmentId, memberId);

            res.status(HTTP_STATUS.OK).json(result);
        }
    );

    static archiveAssessment = asyncHandler(
        async (req: Request, res: Response) => {
            const { assessmentId } = req.params as unknown as AssessmentIdParamDto;
            const memberId = req.companyMember!.id;

            const result = await AssessmentBuilderService.archiveAssessment(assessmentId, memberId);

            res.status(HTTP_STATUS.OK).json(result);
        }
    );

    static duplicateAssessment = asyncHandler(
        async (req: Request, res: Response) => {
            const { assessmentId } = req.params as unknown as AssessmentIdParamDto;
            const memberId = req.companyMember!.id;

            const result = await AssessmentBuilderService.duplicateAssessment(assessmentId, memberId);

            res.status(HTTP_STATUS.OK).json(result);
        }
    );

    static createAssessmentSection = asyncHandler(
        async (req: Request, res: Response) => {
            const { assessmentId } = req.params as unknown as AssessmentIdParamDto;
            const dto = req.body as CreateAssessmentSectionDto;

            const result = await AssessmentBuilderService.createAssessmentSection(assessmentId, dto);

            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: "Assessment section created successfully.",
                data: result
            });
        }
    );

    static getAssessmentSections = asyncHandler(
        async (req: Request, res: Response) => {
            const { assessmentId } = req.params as unknown as AssessmentIdParamDto;

            const result = await AssessmentBuilderService.getAssessmentSections(assessmentId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Assessment sections fetched successfully.",
                data: result
            });
        }
    );

    static updateAssessmentSection = asyncHandler(
        async (req: Request, res: Response) => {
            const { sectionId } = req.params as unknown as SectionIdParamDto;
            const dto = req.body as UpdateAssessmentSectionDto;

            const result = await AssessmentBuilderService.updateAssessmentSection(sectionId, dto);

            res.status(HTTP_STATUS.OK).json(result);
        }
    );

    static deleteAssessmentSection = asyncHandler(
        async (req: Request, res: Response) => {
            const { sectionId } = req.params as unknown as SectionIdParamDto;

            const result = await AssessmentBuilderService.deleteAssessmentSection(sectionId);

            res.status(HTTP_STATUS.OK).json(result);
        }
    );

    static reorderAssessmentSections = asyncHandler(
        async (req: Request, res: Response) => {
            const dto = req.body as ReorderSectionsDto;

            const result = await AssessmentBuilderService.reorderAssessmentSections(dto);

            res.status(HTTP_STATUS.OK).json(result);
        }
    );

    static addQuestionsToSection = asyncHandler(
        async (req: Request, res: Response) => {
            const { sectionId } = req.params as unknown as SectionIdParamDto;
            const dto = req.body as AddQuestionsToSectionDto;

            const result = await AssessmentBuilderService.addQuestionsToSection(sectionId, dto.questions);

            res.status(HTTP_STATUS.OK).json(result);
        }
    );

    static getSectionQuestions = asyncHandler(
        async (req: Request, res: Response) => {
            const { sectionId } = req.params as unknown as SectionIdParamDto;
            const companyId = req.companyMember!.companyId;

            const questions = await AssessmentBuilderService.getSectionQuestions(sectionId, companyId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Section questions fetched successfully.",
                data: questions
            });
        }
    );

    static updateSectionItem = asyncHandler(
        async (req: Request, res: Response) => {
            const { sectionItemId } = req.params as unknown as SectionItemIdParamDto;
            const dto = req.body as UpdateSectionItemDto;
            const companyId = req.companyMember!.companyId;

            await AssessmentBuilderService.updateSectionItem(sectionItemId, dto, companyId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Section item updated successfully."
            });
        }
    );

    static removeQuestionFromSection = asyncHandler(
        async (req: Request, res: Response) => {
            const { sectionItemId } = req.params as unknown as SectionItemIdParamDto;
            const companyId = req.companyMember!.companyId;

            await AssessmentBuilderService.removeQuestionFromSection(sectionItemId, companyId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Question removed from section successfully."
            });
        }
    );

    static reorderQuestions = asyncHandler(
        async (req: Request, res: Response) => {
            const dto = req.body as ReorderQuestionsDto;
            const companyId = req.companyMember!.companyId;

            await AssessmentBuilderService.reorderQuestions(dto, companyId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Questions reordered successfully."
            });
        }
    );
}


