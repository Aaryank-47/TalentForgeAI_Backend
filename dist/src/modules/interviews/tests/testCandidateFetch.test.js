import { describe, it, expect, afterAll, jest } from "@jest/globals";
import prisma, { closeDatabase } from "../../../config/database.js";
import { CandidateInterviewService } from "../services/candidate.interview.service.js";
import { InterviewParticipantType, InterviewAssignmentCreationSource } from "@prisma/client";
describe("Candidate Interview Fetch Test", () => {
    jest.setTimeout(30000);
    afterAll(async () => {
        await closeDatabase();
    });
    it("should fetch real interviews for candidate Sunil and ensure active pending AI interview", async () => {
        const user = await prisma.user.findFirst({ where: { email: "sunil@gmail.com" } });
        expect(user).toBeDefined();
        const candidate = await prisma.candidate.findUnique({ where: { userId: user.id } });
        const interview = await prisma.interview.findFirst({ where: { title: "Infosys AI Technical Interview" } });
        const application = await prisma.application.findFirst({ where: { candidateId: candidate.id } });
        if (candidate && interview && application) {
            let assignment = await prisma.interviewAssignment.findFirst({
                where: { interviewId: interview.id, applicationId: application.id }
            });
            if (!assignment) {
                assignment = await prisma.interviewAssignment.create({
                    data: {
                        interviewId: interview.id,
                        applicationId: application.id,
                        creationSource: InterviewAssignmentCreationSource.MANUAL
                    }
                });
            }
            // Create a fresh SCHEDULED session if all are expired/completed
            const existingActive = await prisma.interviewSession.findFirst({
                where: {
                    interviewId: interview.id,
                    status: "SCHEDULED",
                    participants: {
                        some: {
                            assignmentId: assignment.id
                        }
                    }
                }
            });
            if (!existingActive) {
                await prisma.interviewSession.create({
                    data: {
                        interviewId: interview.id,
                        scheduledAt: new Date(),
                        status: "SCHEDULED",
                        participants: {
                            create: {
                                participantType: InterviewParticipantType.CANDIDATE,
                                assignmentId: assignment.id
                            }
                        }
                    }
                });
            }
        }
        const data = await CandidateInterviewService.getMyInterviews(user.id);
        console.log("Candidate Real Data:", JSON.stringify(data, null, 2));
        expect(data.pending.length).toBeGreaterThan(0);
    });
});
//# sourceMappingURL=testCandidateFetch.test.js.map