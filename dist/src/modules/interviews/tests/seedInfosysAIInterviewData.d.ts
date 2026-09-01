/**
 * Seed helper for the AI Interview Automated Test Suite.
 *
 * Creates a self-contained set of database records that mimic an Infosys
 * AI-interview scenario:
 *   Company -> Recruiter (CompanyMember) -> Candidate (User + Candidate) ->
 *   Job -> Application -> Interview (AI) -> AIInterviewConfiguration ->
 *   InterviewAssignment -> InterviewSession (SCHEDULED, with CANDIDATE participant)
 *
 * Returns the minimal surface area that the test suite needs:
 *   - `normalSessionId`  - the SCHEDULED session the unit/socket tests drive
 *   - candidateUserId  - User.id of the candidate (for service-level auth)
 *   - candidateToken   - signed JWT access token for Socket.IO auth headers
 *   - interviewId      - the Interview.id (for finding assignments in socket tests)
 *
 * The caller is responsible for teardown; no cleanup is performed here.
 */
export declare function seedInfosysTestData(): Promise<{
    /** The primary SCHEDULED session used by unit and socket tests */
    normalSessionId: string;
    /** User.id of the candidate principal */
    candidateUserId: string;
    /** Signed JWT for Socket.IO auth: { auth: { token: candidateToken } } */
    candidateToken: string;
    /** Interview.id - used by socket tests to resolve assignment records */
    interviewId: string;
}>;
//# sourceMappingURL=seedInfosysAIInterviewData.d.ts.map