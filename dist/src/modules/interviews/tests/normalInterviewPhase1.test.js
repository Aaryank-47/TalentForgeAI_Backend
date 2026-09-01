import { describe, test, expect, beforeAll, afterAll, jest } from "@jest/globals";
import prisma, { closeDatabase } from "../../../config/database.js";
import { InterviewSessionsServices, InterviewEvaluationServices } from "../services/interviews.service.js";
import { UserRole, InterviewType, InterviewMode, InterviewSessionStatus } from "@prisma/client";
import { BadRequestError } from "../../../common/errors/BadRequestError.js";
import { ForbiddenError } from "../../../common/errors/ForbiddenError.js";
describe("NORMAL Live 1-to-1 Interview Phase 1 Backend Suite", () => {
    jest.setTimeout(30000); // beforeAll creates interview infrastructure (~5-6s locally, can be longer in CI)
    let company;
    let recruiterUser;
    let recruiterMember;
    let candidateUser;
    let candidate;
    let interview;
    let assignment;
    let session;
    beforeAll(async () => {
        const timestamp = Date.now();
        // 1. Create Company
        company = await prisma.company.create({
            data: {
                companyName: `Phase1 Tech Corp ${timestamp}`,
                slug: `phase1-tech-corp-${timestamp}`,
                status: "ACTIVE"
            }
        });
        // 2. Create Recruiter User & CompanyMember
        recruiterUser = await prisma.user.create({
            data: {
                email: `recruiter_phase1_${timestamp}@example.com`,
                password: "Password@123",
                role: UserRole.EMPLOYER,
                status: "ACTIVE"
            }
        });
        recruiterMember = await prisma.companyMember.create({
            data: {
                userId: recruiterUser.id,
                companyId: company.id,
                role: "RECRUITER",
                status: "ACTIVE"
            }
        });
        // 3. Create Candidate User & Application
        candidateUser = await prisma.user.create({
            data: {
                email: `candidate_phase1_${timestamp}@example.com`,
                password: "Password@123",
                role: UserRole.CANDIDATE,
                status: "ACTIVE"
            }
        });
        candidate = await prisma.candidate.create({
            data: {
                userId: candidateUser.id,
                fullName: "John Doe Phase1"
            }
        });
        const job = await prisma.job.create({
            data: {
                companyId: company.id,
                title: `Senior Backend Engineer ${timestamp}`,
                slug: `senior-backend-engineer-${timestamp}`,
                description: "Node.js & PostgreSQL live technical role",
                employmentType: "FULL_TIME",
                workplaceType: "REMOTE",
                createdById: recruiterUser.id
            }
        });
        const application = await prisma.application.create({
            data: {
                candidateId: candidate.id,
                jobId: job.id,
                status: "APPLIED"
            }
        });
        // 4. Create Normal Live Technical Interview
        interview = await prisma.interview.create({
            data: {
                companyId: company.id,
                createdById: recruiterMember.id,
                title: "Live 1-to-1 Technical Interview",
                type: InterviewType.NORMAL,
                mode: InterviewMode.INDIVIDUAL,
                durationMinutes: 45,
                status: "ACTIVE"
            }
        });
        assignment = await prisma.interviewAssignment.create({
            data: {
                interviewId: interview.id,
                applicationId: application.id,
                creationSource: "MANUAL",
                assignedById: recruiterMember.id
            }
        });
        // 5. Create Session
        session = await prisma.interviewSession.create({
            data: {
                interviewId: interview.id,
                scheduledAt: new Date(Date.now() + 3600000),
                status: InterviewSessionStatus.SCHEDULED,
                participants: {
                    create: [
                        {
                            participantType: "CANDIDATE",
                            assignmentId: assignment.id
                        },
                        {
                            participantType: "INTERVIEWER",
                            companyMemberId: recruiterMember.id
                        }
                    ]
                }
            }
        });
    });
    afterAll(async () => {
        // Clean up created test data
        const sessionIds = session?.id ? [session.id] : [];
        const interviewIds = interview?.id ? [interview.id] : [];
        const assignmentIds = assignment?.id ? [assignment.id] : [];
        const memberIds = recruiterMember?.id ? [recruiterMember.id] : [];
        const candidateIds = candidate?.id ? [candidate.id] : [];
        const userIds = [recruiterUser?.id, candidateUser?.id].filter(Boolean);
        const companyIds = company?.id ? [company.id] : [];
        try {
            if (sessionIds.length > 0 || interviewIds.length > 0) {
                await prisma.$transaction([
                    ...(sessionIds.length > 0 ? [
                        prisma.interviewSessionParticipant.deleteMany({
                            where: { sessionId: { in: sessionIds } }
                        }),
                        prisma.interviewSession.deleteMany({
                            where: { id: { in: sessionIds } }
                        })
                    ] : []),
                    ...(assignmentIds.length > 0 ? [
                        prisma.interviewAssignment.deleteMany({
                            where: { id: { in: assignmentIds } }
                        })
                    ] : []),
                    ...(interviewIds.length > 0 ? [
                        prisma.interview.deleteMany({
                            where: { id: { in: interviewIds } }
                        })
                    ] : []),
                    ...(memberIds.length > 0 ? [
                        prisma.companyMember.deleteMany({
                            where: { id: { in: memberIds } }
                        })
                    ] : []),
                    ...(companyIds.length > 0 ? [
                        prisma.company.deleteMany({
                            where: { id: { in: companyIds } }
                        })
                    ] : []),
                    ...(candidateIds.length > 0 ? [
                        prisma.candidate.deleteMany({
                            where: { id: { in: candidateIds } }
                        })
                    ] : []),
                    ...(userIds.length > 0 ? [
                        prisma.user.deleteMany({
                            where: { id: { in: userIds } }
                        })
                    ] : [])
                ]);
            }
        }
        catch (error) {
            console.error("Error during afterAll cleanup:", error);
        }
        await closeDatabase();
    });
    test("1. Starting a valid SCHEDULED session changes status to IN_PROGRESS", async () => {
        const updated = await InterviewSessionsServices.startSession(company.id, session.id, recruiterUser.id);
        expect(updated.status).toBe(InterviewSessionStatus.IN_PROGRESS);
        expect(updated.startedAt).not.toBeNull();
    });
    test("2. Starting an already active session is rejected", async () => {
        await expect(InterviewSessionsServices.startSession(company.id, session.id, recruiterUser.id)).rejects.toThrow(BadRequestError);
    });
    test("3. Candidate cannot start or end the session", async () => {
        await expect(InterviewSessionsServices.startSession(company.id, session.id, candidateUser.id)).rejects.toThrow(ForbiddenError);
        await expect(InterviewSessionsServices.endSession(company.id, session.id, candidateUser.id)).rejects.toThrow(ForbiddenError);
    });
    test("4. Authorized recruiter can submit scorecard/evaluation", async () => {
        const evalResult = await InterviewEvaluationServices.submitEvaluation(company.id, session.id, recruiterUser.id, {
            overallScore: 92,
            communicationScore: 90,
            technicalScore: 95,
            problemSolvingScore: 90,
            behaviourScore: 85,
            cultureFitScore: 90,
            recommendation: "STRONG_HIRE",
            strengths: ["Strong PostgreSQL knowledge", "Clear communication"],
            improvements: ["Could elaborate more on Redis caching"],
            comments: "Candidate performed exceptionally well in live coding and architecture."
        });
        expect(evalResult).toBeDefined();
        expect(evalResult.overallScore).toBe(92);
        expect(evalResult.recommendation).toBe("STRONG_HIRE");
        expect(evalResult.sessionId).toBe(session.id);
    });
    test("5. Candidate cannot submit recruiter evaluation", async () => {
        await expect(InterviewEvaluationServices.submitEvaluation(company.id, session.id, candidateUser.id, {
            overallScore: 100,
            comments: "Self evaluation"
        })).rejects.toThrow(ForbiddenError);
    });
    test("6. Evaluation can be retrieved", async () => {
        const evaluations = await InterviewEvaluationServices.getEvaluations(company.id, session.id, recruiterUser.id);
        expect(evaluations).toHaveLength(1);
        expect(evaluations[0].overallScore).toBe(92);
        expect(evaluations[0].companyMember.user.email).toBe(recruiterUser.email);
    });
    test("7. Submitting evaluation auto-completes the session (status is COMPLETED)", async () => {
        // submitEvaluation (test 4) auto-transitions the session to COMPLETED.
        // Verify that auto-completion happened correctly by reading the DB state.
        const updatedSession = await prisma.interviewSession.findUnique({
            where: { id: session.id }
        });
        expect(updatedSession).not.toBeNull();
        expect(updatedSession.status).toBe(InterviewSessionStatus.COMPLETED);
        expect(updatedSession.endedAt).not.toBeNull();
    });
    test("8. Ending an already COMPLETED session is rejected", async () => {
        await expect(InterviewSessionsServices.endSession(company.id, session.id, recruiterUser.id)).rejects.toThrow(BadRequestError);
    });
});
//# sourceMappingURL=normalInterviewPhase1.test.js.map