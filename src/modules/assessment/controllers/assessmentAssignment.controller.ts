import type { Request, Response } from "express";
import { JobAssessmentService } from "../services/assessmentAssignment.service.js";
import { asyncHandler } from "../../../common/helper/asyncHandler.js";
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { ApiResponse } from "../../../common/utils/ApiResponse.js";
import type {
    AttachAssessmentsToJobDto,
    JobIdParamDto,
    JobAssessmentIdParamDto,
    ReorderJobAssessmentsDto,
    ApplicationIdParamDto,
    CreateAssessmentInvitationDto,
    TokenParamDto,
    InvitationIdParamDto
} from "../dto/assessmentAssignment.dto.js";

export class JobAssessmentController {
    static attachAssessmentsToJob = asyncHandler(
        async (req: Request, res: Response) => {
            const { jobId } = req.params as unknown as JobIdParamDto;
            const dto = req.body as AttachAssessmentsToJobDto;
            const user = req.user!; // Populated by authMiddleware

            const result = await JobAssessmentService.attachAssessmentsToJob(jobId, dto, user);

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, "Assessments attached successfully.", result)
            );
        }
    );

    static getJobAssessments = asyncHandler(
        async (req: Request, res: Response) => {
            const { jobId } = req.params as unknown as JobIdParamDto;

            const result = await JobAssessmentService.getJobAssessments(jobId);

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, "Job assessments retrieved successfully.", result)
            );
        }
    );

    static updateJobAssessment = asyncHandler(
        async (req: Request, res: Response) => {
            const { jobId } = req.params as unknown as JobIdParamDto;
            const dto = req.body as AttachAssessmentsToJobDto;
            const user = req.user!; // Populated by authMiddleware

            const result = await JobAssessmentService.updateJobAssessment(jobId, dto, user);

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, "Job assessments updated successfully.", result)
            );
        }
    );

    static removeJobAssessment = asyncHandler(
        async (req: Request, res: Response) => {
            const { jobAssessmentId } = req.params as unknown as JobAssessmentIdParamDto;

            await JobAssessmentService.removeJobAssessment(jobAssessmentId);

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, "Assessment removed successfully.", null)
            );
        }
    );

    static reorderJobAssessments = asyncHandler(
        async (req: Request, res: Response) => {
            const dto = req.body as ReorderJobAssessmentsDto;

            await JobAssessmentService.reorderJobAssessments(dto);

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, "Assessment order updated successfully.", null)
            );
        }
    );

    static createAssessmentInvitation = asyncHandler(
        async (req: Request, res: Response) => {
            const { applicationId } = req.params as unknown as ApplicationIdParamDto;
            const dto = req.body as CreateAssessmentInvitationDto;
            const idempotencyKey = req.headers["idempotency-key"] as string | undefined;

            const result = await JobAssessmentService.createAssessmentInvitation(applicationId, dto, idempotencyKey);

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, "Assessment invitation created successfully.", result)
            );
        }
    );

    static getAssessmentInvitation = asyncHandler(
        async (req: Request, res: Response) => {
            const { applicationId } = req.params as unknown as ApplicationIdParamDto;

            const result = await JobAssessmentService.getAssessmentInvitation(applicationId);

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, "Assessment invitation retrieved successfully.", result)
            );
        }
    );

    static validateInvitation = asyncHandler(
        async (req: Request, res: Response) => {
            const { token } = req.params as unknown as TokenParamDto;

            const result = await JobAssessmentService.validateInvitation(token);

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, "Invitation validated successfully.", result)
            );
        }
    );

    static resendInvitation = asyncHandler(
        async (req: Request, res: Response) => {
            const { invitationId } = req.params as unknown as InvitationIdParamDto;

            await JobAssessmentService.resendInvitation(invitationId);

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, "Invitation resent successfully.", null)
            );
        }
    );

    static cancelInvitation = asyncHandler(
        async (req: Request, res: Response) => {
            const { invitationId } = req.params as unknown as InvitationIdParamDto;

            await JobAssessmentService.cancelInvitation(invitationId);

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, "Invitation cancelled successfully.", null)
            );
        }
    );

    static expireInvitation = asyncHandler(
        async (req: Request, res: Response) => {
            const { invitationId } = req.params as unknown as InvitationIdParamDto;

            await JobAssessmentService.expireInvitation(invitationId);

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, "Invitation expired successfully.", null)
            );
        }
    );
}

