import { asyncHandler } from "../../../common/helper/asyncHandler.js";
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { MESSAGE } from "../../../common/constants/messages.js";
import { ApiResponse } from "../../../common/utils/ApiResponse.js";
import { createJobService } from "../services/jobs.services.js";
export class JobAssignmentsController {
    static assignCompanyMemberToJob = asyncHandler(async (req, res) => {
        const { companyId, jobId } = req.params;
        const { companyMemberId } = req.body;
        const assignedBy = req.user.id;
        const assignment = await createJobService.assignCompanyMemberToJob(companyId, jobId, companyMemberId, assignedBy);
        res.status(HTTP_STATUS.CREATED).json(new ApiResponse(true, MESSAGE.JOB_MEMBER_ASSIGNED, assignment));
    });
    static listAssignedCompanyMembersForJob = asyncHandler(async (req, res) => {
        const { companyId, jobId } = req.params;
        const members = await createJobService.listAssignedCompanyMembersForJob(companyId, jobId);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, MESSAGE.JOB_MEMBERS_LISTED, members));
    });
    static removeAssignedCompanyMembersFromJob = asyncHandler(async (req, res) => {
        const { companyId, jobId } = req.params;
        const { companyMemberIds } = req.body;
        await createJobService.removeAssignedCompanyMembersFromJob(companyId, jobId, companyMemberIds);
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, MESSAGE.JOB_MEMBER_REMOVED, null));
    });
}
//# sourceMappingURL=jobAssignments.controller.js.map