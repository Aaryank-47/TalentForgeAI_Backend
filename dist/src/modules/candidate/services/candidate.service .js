import { AuthRepository } from "../../auth/repositories/auth.repository.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
export class CandidateService {
    static async getCandidateProfile(candidateId) {
        const candidate = await AuthRepository.findProfileByUserId(candidateId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }
        return candidate.profile;
    }
}
//# sourceMappingURL=candidate.service%20.js.map