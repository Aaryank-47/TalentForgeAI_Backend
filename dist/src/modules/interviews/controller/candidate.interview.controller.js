import { asyncHandler } from "../../../common/helper/asyncHandler.js";
import { CandidateInterviewService } from "../services/candidate.interview.service.js";
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
export class CandidateInterviewController {
    static getMyInterviews = asyncHandler(async (req, res) => {
        const user = req.user;
        const data = await CandidateInterviewService.getMyInterviews(user.id);
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Candidate interviews fetched successfully",
            data
        });
    });
    static getSessionDetails = asyncHandler(async (req, res) => {
        const user = req.user;
        const { sessionId } = req.params;
        const data = await CandidateInterviewService.getSessionDetails(user.id, sessionId);
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Interview session details fetched successfully",
            data
        });
    });
}
//# sourceMappingURL=candidate.interview.controller.js.map