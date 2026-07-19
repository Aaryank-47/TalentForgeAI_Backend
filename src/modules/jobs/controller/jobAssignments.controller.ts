import type { Request, Response } from "express";
import { asyncHandler } from "../../../common/helper/asyncHandler.js";
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { MESSAGE } from "../../../common/constants/messages.js";
import { ApiResponse } from "../../../common/utils/ApiResponse.js";
import { createJobService } from "../services/jobs.services.js";
import type { 
    AssignCompanyMemberToJobDto,
    JobAssignmentMemberParamsDto,
    RemoveAssignedCompanyMembersDto
} from "../dto/jobs.dto.js";

export class JobAssignmentsController {
    static assignCompanyMemberToJob = asyncHandler(
        async (req: Request, res: Response) => {
            const { companyId, jobId } = req.params as unknown as JobAssignmentMemberParamsDto;
            const { companyMemberId } = req.body as AssignCompanyMemberToJobDto;
            const assignedBy = req.user.id as string;

            const assignment = await createJobService.assignCompanyMemberToJob(
                companyId,
                jobId,
                companyMemberId,
                assignedBy
            );

            res.status(HTTP_STATUS.CREATED).json(
                new ApiResponse(true, MESSAGE.JOB_MEMBER_ASSIGNED, assignment)
            );
        }
    );

    static listAssignedCompanyMembersForJob = asyncHandler(
        async (req: Request, res: Response) => {
            const { companyId, jobId } = req.params as unknown as JobAssignmentMemberParamsDto;

            const members = await createJobService.listAssignedCompanyMembersForJob(
                companyId,
                jobId
            );

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, MESSAGE.JOB_MEMBERS_LISTED, members)
            );
        }
    );

    static removeAssignedCompanyMembersFromJob = asyncHandler(
        async (req: Request, res: Response) => {
            const { companyId, jobId } = req.params as unknown as JobAssignmentMemberParamsDto;
            const { companyMemberIds } = req.body as RemoveAssignedCompanyMembersDto;

            await createJobService.removeAssignedCompanyMembersFromJob(
                companyId,
                jobId,
                companyMemberIds
            );

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, MESSAGE.JOB_MEMBER_REMOVED, null)
            );
        }
    );
}
