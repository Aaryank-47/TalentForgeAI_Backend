import type { RegisterCandidateDto } from "../dto/registerCandidate.dto.js";
import type { RegisterRecruiterDto } from "../dto/registerRecruiter.dto.js";
import type { RegisterCandidateResult, RegisterRecruiterResult } from "../interfaces/auth.interface.js";
export declare class AuthService {
    static registerCandidate(payload: RegisterCandidateDto): Promise<RegisterCandidateResult>;
    static registerRecruiter(payload: RegisterRecruiterDto): Promise<RegisterRecruiterResult>;
}
//# sourceMappingURL=auth.service.d.ts.map