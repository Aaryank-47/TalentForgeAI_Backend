import { AttemptStatus, UserRole } from "@prisma/client";
import type { AssessmentAttemptStartResponse, AssessmentAttemptResponse, PaginatedAssessmentAttemptResponse, AssessmentAttemptResumeResponse, AssessmentSubmissionResponse, AssessmentAnswerResponse, DetailedAssessmentAnswerResponse, ClearAssessmentAnswerResponse } from "../interfaces/candidateAssessment.interface.js";
import { type SaveAssessmentAnswerDto } from "../dto/candidateAssessment.dto.js";
export declare class AssessmentAttemptService {
    static startAssessmentAttempt(userId: string, token: string): Promise<AssessmentAttemptStartResponse>;
    static getAttemptDetails(userId: string, userRole: UserRole, attemptId: string): Promise<AssessmentAttemptResponse>;
    static getCandidateAttempts(userId: string, filters: {
        status?: AttemptStatus;
        page?: number;
        limit?: number;
    }): Promise<PaginatedAssessmentAttemptResponse>;
    static resumeAttempt(userId: string, attemptId: string): Promise<AssessmentAttemptResumeResponse>;
    static submitAttempt(userId: string, attemptId: string): Promise<AssessmentSubmissionResponse>;
    static saveAnswer(userId: string, attemptId: string, questionId: string, dto: SaveAssessmentAnswerDto): Promise<AssessmentAnswerResponse>;
    static getAnswers(userId: string, attemptId: string): Promise<DetailedAssessmentAnswerResponse[]>;
    static getAnswer(userId: string, attemptId: string, questionId: string): Promise<DetailedAssessmentAnswerResponse>;
    static clearAnswer(userId: string, attemptId: string, questionId: string): Promise<ClearAssessmentAnswerResponse>;
}
//# sourceMappingURL=candidateAssessment.service.d.ts.map