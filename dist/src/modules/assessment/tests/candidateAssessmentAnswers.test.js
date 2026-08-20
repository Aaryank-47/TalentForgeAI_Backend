import { describe, test, expect, beforeAll, afterAll, } from "@jest/globals";
import assert from "node:assert";
import prisma, { closeDatabase } from "../../../config/database.js";
import { AssessmentAttemptService } from "../services/candidateAssessment.service.js";
import { AttemptStatus, QuestionType, UserRole } from "@prisma/client";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ForbiddenError } from "../../../common/errors/ForbiddenError.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
describe("Candidate Assessment Answers Get and Delete API tests", () => {
    let candidateUser;
    let candidate2User;
    let candidateProfile;
    let candidate2Profile;
    let company;
    let companyMember;
    let assessment;
    let section;
    let mcqQuestion;
    let dsaQuestion;
    let mcqOption1;
    let activeAttempt;
    let submittedAttempt;
    let cancelledAttempt;
    let expiredAttempt;
    let expiredTimerAttempt;
    let emptyAttempt;
    let savedMcqAnswer;
    let savedDsaAnswer;
    beforeAll(async () => {
        const testId = `test_answers_${Date.now()}`;
        // Create Users & Candidates
        candidateUser = await prisma.user.create({
            data: {
                email: `cand1_${testId}@example.com`,
                password: "hashedpassword",
                role: UserRole.CANDIDATE,
                status: "ACTIVE"
            }
        });
        candidateProfile = await prisma.candidate.create({
            data: {
                userId: candidateUser.id,
                fullName: "Answers Candidate One"
            }
        });
        candidate2User = await prisma.user.create({
            data: {
                email: `cand2_${testId}@example.com`,
                password: "hashedpassword",
                role: UserRole.CANDIDATE,
                status: "ACTIVE"
            }
        });
        candidate2Profile = await prisma.candidate.create({
            data: {
                userId: candidate2User.id,
                fullName: "Answers Candidate Two"
            }
        });
        // Create Company & Member
        company = await prisma.company.create({
            data: {
                companyName: `Answers Test Company ${testId}`,
                slug: `answers-test-company-${testId}`,
                status: "ACTIVE"
            }
        });
        companyMember = await prisma.companyMember.create({
            data: {
                userId: candidateUser.id,
                companyId: company.id,
                role: "OWNER"
            }
        });
        // Create Assessments
        assessment = await prisma.assessment.create({
            data: {
                companyId: company.id,
                title: "Answers API Dev Assessment",
                durationMinutes: 60,
                status: "PUBLISHED",
                createdById: companyMember.id
            }
        });
        // Create Section
        section = await prisma.assessmentSection.create({
            data: {
                assessmentId: assessment.id,
                title: "Section 1",
                displayOrder: 1,
                sectionType: QuestionType.MCQ
            }
        });
        // Create MCQ Question
        mcqQuestion = await prisma.question.create({
            data: {
                title: "MCQ Question",
                description: "Select correct answer",
                type: QuestionType.MCQ,
                difficulty: "EASY",
                estimatedTime: 10,
                defaultMarks: 5.0,
                ownership: "COMPANY",
                companyId: company.id,
                mcqDetail: {
                    create: {
                        allowMultipleCorrectAnswers: false,
                        options: {
                            createMany: {
                                data: [
                                    { optionText: "Option A", displayOrder: 1, isCorrect: true },
                                    { optionText: "Option B", displayOrder: 2, isCorrect: false }
                                ]
                            }
                        }
                    }
                }
            },
            include: {
                mcqDetail: {
                    include: {
                        options: true
                    }
                }
            }
        });
        mcqOption1 = mcqQuestion.mcqDetail.options[0];
        // Create DSA Question
        dsaQuestion = await prisma.question.create({
            data: {
                title: "DSA Question",
                description: "Reverse a linked list",
                type: QuestionType.DSA,
                difficulty: "MEDIUM",
                estimatedTime: 30,
                defaultMarks: 20.0,
                ownership: "COMPANY",
                companyId: company.id,
                dsaDetail: {
                    create: {
                        starterCode: "class Solution {};",
                        referenceSolution: "class Solution {};",
                        memoryLimit: 256,
                        timeLimit: 1000
                    }
                }
            }
        });
        // Map questions to assessment section items
        await prisma.assessmentSectionItem.createMany({
            data: [
                { sectionId: section.id, questionId: mcqQuestion.id, displayOrder: 1 },
                { sectionId: section.id, questionId: dsaQuestion.id, displayOrder: 2 }
            ]
        });
        // Create Application for Candidate 1
        const application = await prisma.application.create({
            data: {
                candidateId: candidateProfile.id,
                jobId: (await prisma.job.create({
                    data: {
                        companyId: company.id,
                        title: "Software Engineer",
                        slug: `se-${testId}`,
                        description: "Job description",
                        employmentType: "FULL_TIME",
                        workplaceType: "REMOTE",
                        createdById: candidateUser.id
                    }
                })).id,
                resumeId: (await prisma.resume.create({
                    data: {
                        candidateId: candidateProfile.id,
                        resumeName: "My Resume",
                        resumeUrl: "http://example.com/resume.pdf",
                        fileSize: 1024
                    }
                })).id,
                status: "APPLIED"
            }
        });
        // Create Attempts
        activeAttempt = await prisma.assessmentAttempt.create({
            data: {
                candidateId: candidateProfile.id,
                applicationId: application.id,
                assessmentId: assessment.id,
                status: AttemptStatus.IN_PROGRESS,
                startedAt: new Date()
            }
        });
        submittedAttempt = await prisma.assessmentAttempt.create({
            data: {
                candidateId: candidateProfile.id,
                applicationId: application.id,
                assessmentId: assessment.id,
                status: AttemptStatus.SUBMITTED,
                startedAt: new Date()
            }
        });
        cancelledAttempt = await prisma.assessmentAttempt.create({
            data: {
                candidateId: candidateProfile.id,
                applicationId: application.id,
                assessmentId: assessment.id,
                status: AttemptStatus.CANCELLED,
                startedAt: new Date()
            }
        });
        expiredAttempt = await prisma.assessmentAttempt.create({
            data: {
                candidateId: candidateProfile.id,
                applicationId: application.id,
                assessmentId: assessment.id,
                status: AttemptStatus.EXPIRED,
                startedAt: new Date()
            }
        });
        expiredTimerAttempt = await prisma.assessmentAttempt.create({
            data: {
                candidateId: candidateProfile.id,
                applicationId: application.id,
                assessmentId: assessment.id,
                status: AttemptStatus.IN_PROGRESS,
                startedAt: new Date(Date.now() - 70 * 60 * 1000)
            }
        });
        emptyAttempt = await prisma.assessmentAttempt.create({
            data: {
                candidateId: candidateProfile.id,
                applicationId: application.id,
                assessmentId: assessment.id,
                status: AttemptStatus.IN_PROGRESS,
                startedAt: new Date()
            }
        });
        // Seed Answers for activeAttempt
        savedMcqAnswer = await prisma.assessmentAnswer.create({
            data: {
                attemptId: activeAttempt.id,
                questionId: mcqQuestion.id,
                startedAt: new Date(),
                selectedOptionIds: [mcqOption1.id]
            }
        });
        savedDsaAnswer = await prisma.assessmentAnswer.create({
            data: {
                attemptId: activeAttempt.id,
                questionId: dsaQuestion.id,
                startedAt: new Date(),
                codeResponse: "class Solution {};",
                meta: { languageId: "lang_cpp" }
            }
        });
        // Seed an answer for submitted/expired/cancelled to test delete block
        await prisma.assessmentAnswer.create({
            data: { attemptId: submittedAttempt.id, questionId: mcqQuestion.id, startedAt: new Date(), selectedOptionIds: [mcqOption1.id] }
        });
        await prisma.assessmentAnswer.create({
            data: { attemptId: expiredAttempt.id, questionId: mcqQuestion.id, startedAt: new Date(), selectedOptionIds: [mcqOption1.id] }
        });
        await prisma.assessmentAnswer.create({
            data: { attemptId: cancelledAttempt.id, questionId: mcqQuestion.id, startedAt: new Date(), selectedOptionIds: [mcqOption1.id] }
        });
        await prisma.assessmentAnswer.create({
            data: { attemptId: expiredTimerAttempt.id, questionId: mcqQuestion.id, startedAt: new Date(), selectedOptionIds: [mcqOption1.id] }
        });
    });
    afterAll(async () => {
        await prisma.$transaction([
            prisma.assessmentAnswer.deleteMany({
                where: {
                    attemptId: {
                        in: [
                            activeAttempt.id,
                            submittedAttempt.id,
                            cancelledAttempt.id,
                            expiredAttempt.id,
                            expiredTimerAttempt.id,
                            emptyAttempt.id
                        ]
                    }
                }
            }),
            prisma.assessmentAttempt.deleteMany({
                where: {
                    id: {
                        in: [
                            activeAttempt.id,
                            submittedAttempt.id,
                            cancelledAttempt.id,
                            expiredAttempt.id,
                            expiredTimerAttempt.id,
                            emptyAttempt.id
                        ]
                    }
                }
            }),
            prisma.assessmentSectionItem.deleteMany({
                where: {
                    sectionId: section.id
                }
            }),
            prisma.assessmentSection.deleteMany({
                where: {
                    id: section.id
                }
            }),
            prisma.question.deleteMany({
                where: {
                    id: { in: [mcqQuestion.id, dsaQuestion.id] }
                }
            }),
            prisma.assessment.deleteMany({
                where: {
                    id: assessment.id
                }
            }),
            prisma.companyMember.deleteMany({
                where: { id: companyMember.id }
            }),
            prisma.company.deleteMany({
                where: { id: company.id }
            }),
            prisma.candidate.deleteMany({
                where: { id: { in: [candidateProfile.id, candidate2Profile.id] } }
            }),
            prisma.user.deleteMany({
                where: { id: { in: [candidateUser.id, candidate2User.id] } }
            })
        ]);
        await closeDatabase();
    });
    describe("GET /api/v1/assessment-attempts/:attemptId/answers", () => {
        test("Succeeds to retrieve all answers for owned active attempt", async () => {
            const answers = await AssessmentAttemptService.getAnswers(candidateUser.id, activeAttempt.id);
            expect(answers.length).toBe(2);
            const mcq = answers.find(a => a.questionId === mcqQuestion.id);
            expect(mcq).toBeDefined();
            expect(mcq?.selectedOptionIds).toEqual([mcqOption1.id]);
            const dsa = answers.find(a => a.questionId === dsaQuestion.id);
            expect(dsa).toBeDefined();
            expect(dsa?.codeResponse).toBe("class Solution {};");
        });
        test("Returns empty array if no answers exist yet", async () => {
            const answers = await AssessmentAttemptService.getAnswers(candidateUser.id, emptyAttempt.id);
            expect(answers).toEqual([]);
        });
        test("Throws ForbiddenError if attempt belongs to another candidate", async () => {
            await expect(AssessmentAttemptService.getAnswers(candidate2User.id, activeAttempt.id)).rejects.toThrow(ForbiddenError);
        });
        test("Throws NotFoundError if attempt does not exist", async () => {
            await expect(AssessmentAttemptService.getAnswers(candidateUser.id, "non-existent-attempt-id")).rejects.toThrow(NotFoundError);
        });
    });
    describe("GET /api/v1/assessment-attempts/:attemptId/answers/:questionId", () => {
        test("Succeeds to retrieve one saved answer", async () => {
            const answer = await AssessmentAttemptService.getAnswer(candidateUser.id, activeAttempt.id, mcqQuestion.id);
            expect(answer).toBeDefined();
            expect(answer.answerId).toBe(savedMcqAnswer.id);
            expect(answer.selectedOptionIds).toEqual([mcqOption1.id]);
        });
        test("Throws NotFoundError if answer has not been saved yet", async () => {
            await expect(AssessmentAttemptService.getAnswer(candidateUser.id, emptyAttempt.id, mcqQuestion.id)).rejects.toThrow(NotFoundError);
        });
        test("Throws ForbiddenError if attempt belongs to another candidate", async () => {
            await expect(AssessmentAttemptService.getAnswer(candidate2User.id, activeAttempt.id, mcqQuestion.id)).rejects.toThrow(ForbiddenError);
        });
        test("Throws NotFoundError if attempt does not exist", async () => {
            await expect(AssessmentAttemptService.getAnswer(candidateUser.id, "non-existent-attempt-id", mcqQuestion.id)).rejects.toThrow(NotFoundError);
        });
    });
    describe("DELETE /api/v1/assessment-attempts/:attemptId/answers/:questionId", () => {
        test("Throws ForbiddenError if attempt belongs to another candidate", async () => {
            await expect(AssessmentAttemptService.clearAnswer(candidate2User.id, activeAttempt.id, mcqQuestion.id)).rejects.toThrow(ForbiddenError);
        });
        test("Throws ConflictError if attempt is SUBMITTED", async () => {
            await expect(AssessmentAttemptService.clearAnswer(candidateUser.id, submittedAttempt.id, mcqQuestion.id)).rejects.toThrow(ConflictError);
        });
        test("Throws ConflictError if attempt is EXPIRED", async () => {
            await expect(AssessmentAttemptService.clearAnswer(candidateUser.id, expiredAttempt.id, mcqQuestion.id)).rejects.toThrow(ConflictError);
        });
        test("Throws ConflictError if attempt is CANCELLED", async () => {
            await expect(AssessmentAttemptService.clearAnswer(candidateUser.id, cancelledAttempt.id, mcqQuestion.id)).rejects.toThrow(ConflictError);
        });
        test("Throws ConflictError and sets attempt to EXPIRED if timer is expired", async () => {
            await expect(AssessmentAttemptService.clearAnswer(candidateUser.id, expiredTimerAttempt.id, mcqQuestion.id)).rejects.toThrow(ConflictError);
            const updatedAttempt = await prisma.assessmentAttempt.findUnique({
                where: { id: expiredTimerAttempt.id }
            });
            expect(updatedAttempt?.status).toBe(AttemptStatus.EXPIRED);
        });
        test("Throws NotFoundError if answer does not exist", async () => {
            await expect(AssessmentAttemptService.clearAnswer(candidateUser.id, emptyAttempt.id, mcqQuestion.id)).rejects.toThrow(NotFoundError);
        });
        test("Succeeds to clear/delete a saved answer", async () => {
            const res = await AssessmentAttemptService.clearAnswer(candidateUser.id, activeAttempt.id, mcqQuestion.id);
            expect(res.attemptId).toBe(activeAttempt.id);
            expect(res.questionId).toBe(mcqQuestion.id);
            const check = await prisma.assessmentAnswer.findUnique({
                where: {
                    attemptId_questionId: {
                        attemptId: activeAttempt.id,
                        questionId: mcqQuestion.id
                    }
                }
            });
            expect(check).toBeNull();
        });
    });
});
//# sourceMappingURL=candidateAssessmentAnswers.test.js.map