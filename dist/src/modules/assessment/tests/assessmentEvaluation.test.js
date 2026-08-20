import { describe, test, expect, beforeAll, afterAll, } from "@jest/globals";
import assert from "node:assert";
import prisma, { closeDatabase } from "../../../config/database.js";
import { AssessmentEvaluationService } from "../services/assessmentEvaluation.service.js";
import { AttemptStatus, EvaluationStatus, QuestionType, UserRole } from "@prisma/client";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ForbiddenError } from "../../../common/errors/ForbiddenError.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { ValidationError } from "../../../common/errors/ValidationError.js";
describe("Assessment Evaluation API tests", () => {
    let candidateUser;
    let candidate2User;
    let employerUser;
    let candidateProfile;
    let company;
    let companyMember;
    let assessment;
    let section;
    let mcqQuestion;
    let dsaQuestion;
    let mcqOption1;
    let progLanguage;
    let inProgressAttempt;
    let submittedAttempt;
    let evaluatingAttempt;
    let completedAttempt;
    beforeAll(async () => {
        const testId = `test_eval_${Date.now()}`;
        // Users & Candidates
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
                fullName: "Evaluation Candidate One"
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
        employerUser = await prisma.user.create({
            data: {
                email: `emp_${testId}@example.com`,
                password: "hashedpassword",
                role: UserRole.EMPLOYER,
                status: "ACTIVE"
            }
        });
        // Company & Member
        company = await prisma.company.create({
            data: {
                companyName: `Evaluation Test Company ${testId}`,
                slug: `eval-test-company-${testId}`,
                status: "ACTIVE"
            }
        });
        companyMember = await prisma.companyMember.create({
            data: {
                userId: employerUser.id,
                companyId: company.id,
                role: "RECRUITER",
                status: "ACTIVE"
            }
        });
        // Programming Language
        progLanguage = await prisma.programmingLanguage.create({
            data: {
                name: `C++ ${testId}`,
                slug: `cpp-${testId}`,
                isActive: true
            }
        });
        // Assessment
        assessment = await prisma.assessment.create({
            data: {
                companyId: company.id,
                title: "Evaluation API Assessment",
                durationMinutes: 60,
                status: "PUBLISHED",
                passingScore: 50.0,
                createdById: companyMember.id
            }
        });
        // Section
        section = await prisma.assessmentSection.create({
            data: {
                assessmentId: assessment.id,
                title: "Section 1",
                displayOrder: 1,
                sectionType: QuestionType.MCQ
            }
        });
        // MCQ Question
        mcqQuestion = await prisma.question.create({
            data: {
                title: "Evaluation MCQ",
                description: "Select correct answer",
                type: QuestionType.MCQ,
                difficulty: "EASY",
                estimatedTime: 10,
                defaultMarks: 50.0,
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
        // DSA Question
        dsaQuestion = await prisma.question.create({
            data: {
                title: "Evaluation DSA",
                description: "Reverse a linked list",
                type: QuestionType.DSA,
                difficulty: "MEDIUM",
                estimatedTime: 30,
                defaultMarks: 50.0,
                ownership: "COMPANY",
                companyId: company.id,
                dsaDetail: {
                    create: {
                        starterCode: "class Solution {};",
                        referenceSolution: "class Solution {};",
                        memoryLimit: 256,
                        timeLimit: 1000,
                        supportedLanguages: {
                            create: {
                                programmingLanguageId: progLanguage.id
                            }
                        }
                    }
                }
            }
        });
        // Map section items
        await prisma.assessmentSectionItem.createMany({
            data: [
                { sectionId: section.id, questionId: mcqQuestion.id, displayOrder: 1 },
                { sectionId: section.id, questionId: dsaQuestion.id, displayOrder: 2 }
            ]
        });
        // Create Application
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
                        createdById: employerUser.id
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
        // IN_PROGRESS Attempt
        inProgressAttempt = await prisma.assessmentAttempt.create({
            data: {
                candidateId: candidateProfile.id,
                applicationId: application.id,
                assessmentId: assessment.id,
                status: AttemptStatus.IN_PROGRESS,
                startedAt: new Date(),
                evaluationStatus: EvaluationStatus.PENDING
            }
        });
        // SUBMITTED Attempt
        submittedAttempt = await prisma.assessmentAttempt.create({
            data: {
                candidateId: candidateProfile.id,
                applicationId: application.id,
                assessmentId: assessment.id,
                status: AttemptStatus.SUBMITTED,
                startedAt: new Date(),
                evaluationStatus: EvaluationStatus.PENDING
            }
        });
        // EVALUATING Attempt
        evaluatingAttempt = await prisma.assessmentAttempt.create({
            data: {
                candidateId: candidateProfile.id,
                applicationId: application.id,
                assessmentId: assessment.id,
                status: AttemptStatus.SUBMITTED,
                startedAt: new Date(),
                evaluationStatus: EvaluationStatus.EVALUATING
            }
        });
        // COMPLETED Attempt
        completedAttempt = await prisma.assessmentAttempt.create({
            data: {
                candidateId: candidateProfile.id,
                applicationId: application.id,
                assessmentId: assessment.id,
                status: AttemptStatus.SUBMITTED,
                startedAt: new Date(),
                evaluationStatus: EvaluationStatus.COMPLETED,
                overallScore: 50.0,
                percentage: 50.0,
                passed: true
            }
        });
        // Pre-save MCQ Correct Answer to submittedAttempt to test auto evaluation
        await prisma.assessmentAnswer.create({
            data: {
                attemptId: submittedAttempt.id,
                questionId: mcqQuestion.id,
                startedAt: new Date(),
                selectedOptionIds: [mcqOption1.id]
            }
        });
        // Pre-save DSA Answer to submittedAttempt
        await prisma.assessmentAnswer.create({
            data: {
                attemptId: submittedAttempt.id,
                questionId: dsaQuestion.id,
                startedAt: new Date(),
                codeResponse: "class Solution { public: void test() {} };"
            }
        });
    });
    afterAll(async () => {
        await prisma.$transaction([
            prisma.assessmentAnswer.deleteMany({
                where: {
                    attemptId: {
                        in: [
                            inProgressAttempt.id,
                            submittedAttempt.id,
                            evaluatingAttempt.id,
                            completedAttempt.id
                        ]
                    }
                }
            }),
            prisma.assessmentAttempt.deleteMany({
                where: {
                    id: {
                        in: [
                            inProgressAttempt.id,
                            submittedAttempt.id,
                            evaluatingAttempt.id,
                            completedAttempt.id
                        ]
                    }
                }
            }),
            prisma.assessmentSectionItem.deleteMany({
                where: { sectionId: section.id }
            }),
            prisma.assessmentSection.deleteMany({
                where: { id: section.id }
            }),
            prisma.question.deleteMany({
                where: { id: { in: [mcqQuestion.id, dsaQuestion.id] } }
            }),
            prisma.assessment.deleteMany({
                where: { id: assessment.id }
            }),
            prisma.companyMember.deleteMany({
                where: { id: companyMember.id }
            }),
            prisma.company.deleteMany({
                where: { id: company.id }
            }),
            prisma.candidate.deleteMany({
                where: { id: candidateProfile.id }
            }),
            prisma.user.deleteMany({
                where: { id: { in: [candidateUser.id, candidate2User.id, employerUser.id] } }
            })
        ]);
        await closeDatabase();
    });
    describe("POST /api/v1/assessment-attempts/:attemptId/evaluate", () => {
        test("Succeeds to start evaluation on submitted attempt", async () => {
            const res = await AssessmentEvaluationService.startEvaluation(employerUser.id, submittedAttempt.id);
            expect(res.attemptId).toBe(submittedAttempt.id);
            expect(res.evaluationStatus).toBe(EvaluationStatus.EVALUATING);
            // Wait brief moment for asynchronous evaluation orchestrator to finish
            await new Promise(r => setTimeout(r, 100));
            const updated = await prisma.assessmentAttempt.findUnique({
                where: { id: submittedAttempt.id }
            });
            expect(updated?.evaluationStatus).toBe(EvaluationStatus.COMPLETED);
            expect(updated?.overallScore).toBe(100.0); // 50 MCQ + 50 DSA
            expect(updated?.passed).toBe(true);
        });
        test("Throws ConflictError if attempt is in IN_PROGRESS status", async () => {
            await expect(AssessmentEvaluationService.startEvaluation(employerUser.id, inProgressAttempt.id)).rejects.toThrow(ConflictError);
        });
        test("Throws ConflictError if attempt is already EVALUATING or COMPLETED", async () => {
            await expect(AssessmentEvaluationService.startEvaluation(employerUser.id, completedAttempt.id)).rejects.toThrow(ConflictError);
        });
    });
    describe("GET /api/v1/assessment-attempts/:attemptId/evaluation", () => {
        test("Candidate can get status of their own attempt", async () => {
            const res = await AssessmentEvaluationService.getEvaluationStatus(candidateUser.id, UserRole.CANDIDATE, completedAttempt.id);
            expect(res.evaluationStatus).toBe(EvaluationStatus.COMPLETED);
        });
        test("Candidate cannot get status of other candidate's attempt", async () => {
            await expect(AssessmentEvaluationService.getEvaluationStatus(candidate2User.id, UserRole.CANDIDATE, completedAttempt.id)).rejects.toThrow(ForbiddenError);
        });
        test("Employer belonging to the company can get evaluation status", async () => {
            const res = await AssessmentEvaluationService.getEvaluationStatus(employerUser.id, UserRole.EMPLOYER, completedAttempt.id);
            expect(res.evaluationStatus).toBe(EvaluationStatus.COMPLETED);
        });
    });
    describe("POST /api/v1/assessment-attempts/:attemptId/questions/:questionId/run", () => {
        test("Succeeds to run code for own IN_PROGRESS DSA question", async () => {
            const res = await AssessmentEvaluationService.runCode(candidateUser.id, inProgressAttempt.id, dsaQuestion.id, "class Solution {};", progLanguage.id);
            expect(res.status).toBe("PASSED");
            expect(res.passedTestCases).toBe(2);
        });
        test("Throws ValidationError if question type is not DSA", async () => {
            await expect(AssessmentEvaluationService.runCode(candidateUser.id, inProgressAttempt.id, mcqQuestion.id, "class Solution {};", progLanguage.id)).rejects.toThrow(ValidationError);
        });
        test("Throws ConflictError if attempt is not IN_PROGRESS", async () => {
            await expect(AssessmentEvaluationService.runCode(candidateUser.id, completedAttempt.id, dsaQuestion.id, "class Solution {};", progLanguage.id)).rejects.toThrow(ConflictError);
        });
    });
    describe("POST /api/v1/assessment-attempts/:attemptId/questions/:questionId/evaluation", () => {
        test("Employer can evaluate question manually", async () => {
            const res = await AssessmentEvaluationService.evaluateQuestionManually(employerUser.id, completedAttempt.id, mcqQuestion.id, 10.0, "Manual review feedback");
            expect(res.score).toBe(10.0);
            expect(res.feedback).toBe("Manual review feedback");
            const saved = await prisma.assessmentAnswer.findUnique({
                where: {
                    attemptId_questionId: {
                        attemptId: completedAttempt.id,
                        questionId: mcqQuestion.id
                    }
                }
            });
            expect(saved?.score).toBe(10.0);
            expect(saved?.feedback).toBe("Manual review feedback");
        });
        test("Throws ValidationError if manual score exceeds max marks", async () => {
            await expect(AssessmentEvaluationService.evaluateQuestionManually(employerUser.id, completedAttempt.id, mcqQuestion.id, 999.0, "Exceeding marks")).rejects.toThrow(ValidationError);
        });
    });
    describe("GET /api/v1/assessment-attempts/:attemptId/evaluation/result", () => {
        test("Succeeds to retrieve final completed result", async () => {
            const res = await AssessmentEvaluationService.getFinalResult(candidateUser.id, UserRole.CANDIDATE, completedAttempt.id);
            expect(res.overallScore).toBeDefined();
            expect(res.passed).toBeDefined();
            expect(res.evaluationStatus).toBe(EvaluationStatus.COMPLETED);
        });
        test("Throws ConflictError if status is not COMPLETED", async () => {
            await expect(AssessmentEvaluationService.getFinalResult(candidateUser.id, UserRole.CANDIDATE, inProgressAttempt.id)).rejects.toThrow(ConflictError);
        });
    });
});
//# sourceMappingURL=assessmentEvaluation.test.js.map