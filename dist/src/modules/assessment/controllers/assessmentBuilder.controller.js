import { AssessmentBuilderService } from "../services/assessmentBuilder.service.js";
import { asyncHandler } from "../../../common/helper/asyncHandler.js";
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
export class AssessmentBuilderController {
    static createAssessment = asyncHandler(async (req, res) => {
        const dto = req.body;
        const user = req.user;
        const result = await AssessmentBuilderService.createAssessment(dto, user);
        res.status(HTTP_STATUS.CREATED).json(result);
    });
    static getAssessments = asyncHandler(async (req, res) => {
        const filters = req.query;
        const user = req.user;
        const result = await AssessmentBuilderService.getAssessments(filters, user);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result
        });
    });
    static getAssessmentById = asyncHandler(async (req, res) => {
        const { assessmentId } = req.params;
        const user = req.user;
        const result = await AssessmentBuilderService.getAssessmentById(assessmentId, user);
        res.status(HTTP_STATUS.OK).json(result);
    });
    static updateAssessment = asyncHandler(async (req, res) => {
        const { assessmentId } = req.params;
        const dto = req.body;
        const user = req.user;
        const result = await AssessmentBuilderService.updateAssessment(assessmentId, dto, user);
        res.status(HTTP_STATUS.OK).json(result);
    });
    static deleteAssessment = asyncHandler(async (req, res) => {
        const { assessmentId } = req.params;
        const user = req.user;
        const result = await AssessmentBuilderService.deleteAssessment(assessmentId, user);
        res.status(HTTP_STATUS.OK).json(result);
    });
    static publishAssessment = asyncHandler(async (req, res) => {
        const { assessmentId } = req.params;
        const user = req.user;
        const result = await AssessmentBuilderService.publishAssessment(assessmentId, user);
        res.status(HTTP_STATUS.OK).json(result);
    });
    static archiveAssessment = asyncHandler(async (req, res) => {
        const { assessmentId } = req.params;
        const user = req.user;
        const result = await AssessmentBuilderService.archiveAssessment(assessmentId, user);
        res.status(HTTP_STATUS.OK).json(result);
    });
    static duplicateAssessment = asyncHandler(async (req, res) => {
        const { assessmentId } = req.params;
        const user = req.user;
        const result = await AssessmentBuilderService.duplicateAssessment(assessmentId, user);
        res.status(HTTP_STATUS.OK).json(result);
    });
}
//# sourceMappingURL=assessmentBuilder.controller.js.map