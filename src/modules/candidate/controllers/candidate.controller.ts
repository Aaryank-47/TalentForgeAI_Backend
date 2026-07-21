import { MESSAGE } from "../../../common/constants/messages.js"
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js"
import { CandidateService } from "../services/candidate.service .js";
import type { Request, Response } from "express";

export class CandidateController {
    static async getCandidateProfile(
        req: Request,
        res: Response
    ): Promise<void> {
        const candidateId = req.user.id;
        const candidate = await CandidateService.getCandidateProfile(candidateId);
        res.status(HTTP_STATUS.OK ).json({
            success: true,
            message: "Candidate profile fetched successfully",
            data: candidate
        });
    }

    static async updateCandidateProfile(
        req: Request,
        res: Response
    ): Promise<void> {
        const candidateId = req.user.id;
        const updateData = req.body;
        const candidate = await CandidateService.updateProfile(candidateId, updateData);
        console.log("candidate from candidate controller : ",candidate);
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGE.USER_PROFILE_UPDATED,
            data: candidate
        });
    }
}

