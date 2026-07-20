import { CandidateService } from "../services/candidate.service .js";
import type { Request, Response } from "express";

export class CandidateController {
    static async getCandidateProfile(
        req:Request,
        res:Response    
    ): Promise<void> {
        const candidateId = req.user.id;
        const candidate = await CandidateService.getCandidateProfile(candidateId);
        res.status(200).json({
            success: true,
            message: "Candidate profile fetched successfully",
            data: candidate
        });
    }
}

