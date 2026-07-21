import { AuthRepository } from "../../auth/repositories/auth.repository.js"
import { NotFoundError } from "../../../common/errors/NotFoundError.js"
import type { CandidateProfileView } from "../interfaces/candidate.interface.js"
import { CandidateRepository } from "../repository/candiadate.repository.js";
import type { UpdateCandidateProfileDto } from "../dto/candidate.dto.js"
import { calculateCandidateProfileCompletion } from "../utils/profileCompletion.util.js";


export class CandidateService {
    static async getCandidateProfile(
        candidateId: string
    ): Promise<CandidateProfileView> {
        const candidate = await AuthRepository.findProfileByUserId(candidateId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }

        return candidate.profile;
    }

    static async updateProfile(
        candidateId: string,
        updateData: UpdateCandidateProfileDto
    ): Promise<CandidateProfileView> {
        const candidate = await AuthRepository.findProfileByUserId(candidateId);

        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }

        console.log("candidateid : ", candidateId);
        console.log("UpdatedData : ", updateData);
        
        const updateCandidateProfile = await CandidateRepository.updateCandidateProfile(candidateId, updateData);
        
        return updateCandidateProfile;
    }

    static async calculateProfileCompletion(
        candidateId: string
    ): Promise<number> {
        const candidate = await CandidateRepository.findProfileWithRelationsCount(candidateId);
        if (!candidate) {
            throw new NotFoundError("Candidate profile not found");
        }

        return calculateCandidateProfileCompletion(candidate);
    }
}