import { UserRole } from "@prisma/client";
import type { ApplicationAssessmentResultResponse, ATSAssessmentProcessingResult, AssessmentOutcome } from "../interfaces/atsIntegration.interface.js";
export declare class AssessmentOutcomeService {
    static determineOutcome(attemptId: string): Promise<AssessmentOutcome>;
}
export declare class AssessmentATSIntegrationService {
    static getAssessmentResultByApplication(userId: string, role: UserRole, applicationId: string): Promise<ApplicationAssessmentResultResponse>;
    static processAssessmentResult(attemptId: string): Promise<ATSAssessmentProcessingResult>;
}
//# sourceMappingURL=atsIntegration.service.d.ts.map