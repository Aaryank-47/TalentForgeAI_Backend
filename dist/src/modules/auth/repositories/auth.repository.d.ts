import type { CandidateProfileView } from "../../candidate/interfaces/candidate.interface.js";
import type { RecruiterCompanyInput, RecruiterCompanyView, RecruiterProfileView } from "../../recruiter/interfaces/recruiter.interface.js";
import type { RegisterCandidateInput, RegisterRecruiterInput, AuthUserView } from "../interfaces/auth.interface.js";
export declare class AuthRepository {
    static findUserByEmail(email: string): Promise<AuthUserView | null>;
    static createCandidateRegistration(data: RegisterCandidateInput): Promise<{
        user: AuthUserView;
        candidate: CandidateProfileView;
    }>;
    static findCompanyById(companyId: string): Promise<RecruiterCompanyView | null>;
    static createCompany(companyInput: RecruiterCompanyInput): Promise<RecruiterCompanyView>;
    static createRecruiterRegistration(data: RegisterRecruiterInput): Promise<{
        user: AuthUserView;
        company: RecruiterCompanyView;
        recruiter: RecruiterProfileView;
    }>;
    static saveRefreshToken(data: {
        token: string;
        userId: string;
        expiresAt: Date;
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        token: string;
        expiresAt: Date;
        revokedAt: Date | null;
    }>;
}
//# sourceMappingURL=auth.repository.d.ts.map