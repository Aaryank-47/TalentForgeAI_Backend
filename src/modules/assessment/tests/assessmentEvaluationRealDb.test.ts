import {
    describe,
    test,
    expect,
    beforeAll,
    afterAll,
} from "@jest/globals";
import prisma, { closeDatabase } from "../../../config/database.js";
import { AssessmentEvaluationService } from "../services/assessmentEvaluation.service.js";
import { AssessmentAttemptService } from "../services/candidateAssessment.service.js";
import { AttemptStatus, EvaluationStatus, QuestionType, UserRole } from "@prisma/client";

describe("Mode 2: Real Database Assessment Evaluation Integration Test", () => {
    let candidateUser: any;
    let employerUser: any;
    let candidateProfile: any;
    let company: any;
    let companyMember: any;
    let assessment: any;
    let section: any;
    let question: any;
    let attempt: any;
    let job: any;
    let application: any;

    beforeAll(async () => {
        const testId = `real_eval_${Date.now()}`;

        // Create unique Users
        candidateUser = await prisma.user.create({
            data: {
                email: `real_cand_${testId}@example.com`,
                password: "hashedpassword",
                role: UserRole.CANDIDATE,
                status: "ACTIVE"
            }
        });
        candidateProfile = await prisma.candidate.create({
            data: {
                userId: candidateUser.id,
                fullName: "Real Eval Candidate"
            }
        });

        employerUser = await prisma.user.create({
            data: {
                email: `real_emp_${testId}@example.com`,
                password: "hashedpassword",
                role: UserRole.EMPLOYER,
                status: "ACTIVE"
            }
        });

        // Resolve Company and Recruiters
        company = await prisma.company.create({
            data: {
                companyName: `Real Eval Company ${testId}`,
                slug: `real-eval-company-${testId}`,
                status: "ACTIVE"
            }
        });
        companyMember = await prisma.companyMember.create({
            data: {
                userId: employerUser.id,
                companyId: company.id,
                role: "OWNER",
                status: "ACTIVE"
            }
        });

        // Resolve Job
        job = await prisma.job.create({
            data: {
                companyId: company.id,
                title: "Software Engineer [Real Eval]",
                slug: `se-real-eval-${testId}`,
                description: "Job description for test",
                employmentType: "FULL_TIME",
                workplaceType: "REMOTE",
                createdById: employerUser.id
            }
        });

        // Resolve Application
        const resume = await prisma.resume.create({
            data: {
                candidateId: candidateProfile.id,
                resumeName: "My Resume",
                resumeUrl: "http://example.com/resume.pdf",
                fileSize: 1024
            }
        });
        application = await prisma.application.create({
            data: {
                candidateId: candidateProfile.id,
                jobId: job.id,
                resumeId: resume.id,
                status: "APPLIED"
            }
        });

        // Resolve Assessment
        assessment = await prisma.assessment.create({
            data: {
                companyId: company.id,
                title: "Real Eval Assessment",
                durationMinutes: 60,
                status: "PUBLISHED",
                passingScore: 50.0,
                createdById: companyMember.id
            }
        });

        // Resolve Assessment Section
        section = await prisma.assessmentSection.create({
            data: {
                assessmentId: assessment.id,
                title: "Section 1",
                displayOrder: 1,
                sectionType: QuestionType.MCQ
            }
        });

        // Resolve MCQ Question
        question = await prisma.question.create({
            data: {
                title: "Real MCQ Question",
                description: "Select correct answer",
                type: QuestionType.MCQ,
                difficulty: "EASY",
                estimatedTime: 10,
                defaultMarks: 10.0,
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

        await prisma.assessmentSectionItem.create({
            data: {
                sectionId: section.id,
                questionId: question.id,
                displayOrder: 1
            }
        });

        // Create Attempt
        attempt = await prisma.assessmentAttempt.create({
            data: {
                candidateId: candidateProfile.id,
                applicationId: application.id,
                assessmentId: assessment.id,
                status: AttemptStatus.IN_PROGRESS,
                startedAt: new Date(),
                evaluationStatus: EvaluationStatus.PENDING
            }
        });
    });

    afterAll(async () => {
        // Clean up real DB test entries to avoid polluting
        await prisma.$transaction([
            prisma.assessmentAnswer.deleteMany({ where: { attemptId: attempt.id } }),
            prisma.assessmentAttempt.deleteMany({ where: { id: attempt.id } }),
            prisma.assessmentSectionItem.deleteMany({ where: { sectionId: section.id } }),
            prisma.assessmentSection.deleteMany({ where: { id: section.id } }),
            prisma.question.deleteMany({ where: { id: question.id } }),
            prisma.assessment.deleteMany({ where: { id: assessment.id } }),
            prisma.application.deleteMany({ where: { id: application.id } }),
            prisma.job.deleteMany({ where: { id: job.id } }),
            prisma.companyMember.deleteMany({ where: { id: companyMember.id } }),
            prisma.company.deleteMany({ where: { id: company.id } }),
            prisma.candidate.deleteMany({ where: { id: candidateProfile.id } }),
            prisma.user.deleteMany({ where: { id: { in: [candidateUser.id, employerUser.id] } } })
        ]);
        await closeDatabase();
    });

    test("Recruiter and Candidate API evaluation workflow on real DB", async () => {
        // 1. Candidate saves MCQ Answer
        const saveRes = await AssessmentAttemptService.saveAnswer(
            candidateUser.id,
            attempt.id,
            question.id,
            { selectedOptionIds: [question.mcqDetail.options[0].id] }
        );
        expect(saveRes.answerId).toBeDefined();

        // 2. Candidate submits Assessment Attempt
        const submitRes = await AssessmentAttemptService.submitAttempt(candidateUser.id, attempt.id);
        expect(submitRes.status).toBe(AttemptStatus.SUBMITTED);

        // 3. Recruiter starts evaluation
        const startEvalRes = await AssessmentEvaluationService.startEvaluation(employerUser.id, attempt.id);
        expect(startEvalRes.evaluationStatus).toBe(EvaluationStatus.EVALUATING);

        // Wait a small buffer for async evaluation to complete
        await new Promise(r => setTimeout(r, 150));

        // 4. Recruiter check status
        const statusRes = await AssessmentEvaluationService.getEvaluationStatus(employerUser.id, UserRole.EMPLOYER, attempt.id);
        expect(statusRes.evaluationStatus).toBe(EvaluationStatus.COMPLETED);

        // 5. Recruiter submits manual review feedback
        const manualRes = await AssessmentEvaluationService.evaluateQuestionManually(
            employerUser.id,
            attempt.id,
            question.id,
            8.0,
            "Good choice of option."
        );
        expect(manualRes.score).toBe(8.0);
        expect(manualRes.feedback).toBe("Good choice of option.");

        // 6. Candidate retrieves final result
        const resultRes = await AssessmentEvaluationService.getFinalResult(candidateUser.id, UserRole.CANDIDATE, attempt.id);
        expect(resultRes.evaluationStatus).toBe(EvaluationStatus.COMPLETED);
        expect(resultRes.overallScore).toBe(8.0); // manual score updated
        expect(resultRes.passed).toBe(true); // 8/10 = 80% passing Score is 50%
    });
});
