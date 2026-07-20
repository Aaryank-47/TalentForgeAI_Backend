import { CandidateService } from "../services/candidate.service .js";
export class CandidateController {
    static async getCandidateProfile(req, res) {
        const { candidateId } = req.params;
        const candidate = await CandidateService.getCandidateProfile(candidateId);
        res.status(200).json({
            success: true,
            message: "Candidate profile fetched successfully",
            data: candidate
        });
    }
}
//# sourceMappingURL=candidate.controller.js.map