import { JobAssessmentService } from "../services/assessmentAssignment.service.js";
import { asyncHandler } from "../../../common/helper/asyncHandler.js";
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { ApiResponse } from "../../../common/utils/ApiResponse.js";
export class JobAssessmentController {
    static attachAssessmentsToJob = asyncHandler(async (req, res) => {
        const { jobId } = req.params;
        const dto = req.body;
        const user = req.user; // Populated by authMiddleware
        const result = await JobAssessmentService.attachAssessmentsToJob(jobId, dto, user);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Assessments attached successfully.", result));
    });
    static getJobAssessments = asyncHandler(async (req, res) => {
        const { jobId } = req.params;
        const result = await JobAssessmentService.getJobAssessments(jobId);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Job assessments retrieved successfully.", result));
    });
    static updateJobAssessment = asyncHandler(async (req, res) => {
        const { jobId } = req.params;
        const dto = req.body;
        const user = req.user; // Populated by authMiddleware
        const result = await JobAssessmentService.updateJobAssessment(jobId, dto, user);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Job assessments updated successfully.", result));
    });
    static removeJobAssessment = asyncHandler(async (req, res) => {
        const { jobAssessmentId } = req.params;
        await JobAssessmentService.removeJobAssessment(jobAssessmentId);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Assessment removed successfully.", null));
    });
    static reorderJobAssessments = asyncHandler(async (req, res) => {
        const dto = req.body;
        await JobAssessmentService.reorderJobAssessments(dto);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Assessment order updated successfully.", null));
    });
    static createAssessmentInvitation = asyncHandler(async (req, res) => {
        const { applicationId } = req.params;
        const dto = req.body;
        const idempotencyKey = req.headers["idempotency-key"];
        const result = await JobAssessmentService.createAssessmentInvitation(applicationId, dto, idempotencyKey);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Assessment invitation created successfully.", result));
    });
    static getCandidateMyInvitations = asyncHandler(async (req, res) => {
        const user = req.user;
        const result = await JobAssessmentService.getCandidateMyInvitations(user.id);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Candidate assessment invitations retrieved successfully.", result));
    });
    static getAssessmentInvitation = asyncHandler(async (req, res) => {
        const { applicationId } = req.params;
        const result = await JobAssessmentService.getAssessmentInvitation(applicationId);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Assessment invitation retrieved successfully.", result));
    });
    static validateInvitation = asyncHandler(async (req, res) => {
        const { token } = req.params;
        const result = await JobAssessmentService.validateInvitation(token);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Invitation validated successfully.", result));
    });
    static resendInvitation = asyncHandler(async (req, res) => {
        const { invitationId } = req.params;
        await JobAssessmentService.resendInvitation(invitationId);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Invitation resent successfully.", null));
    });
    static cancelInvitation = asyncHandler(async (req, res) => {
        const { invitationId } = req.params;
        await JobAssessmentService.cancelInvitation(invitationId);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Invitation cancelled successfully.", null));
    });
    static expireInvitation = asyncHandler(async (req, res) => {
        const { invitationId } = req.params;
        await JobAssessmentService.expireInvitation(invitationId);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, "Invitation expired successfully.", null));
    });
}
//# sourceMappingURL=assessmentAssignment.controller.js.map