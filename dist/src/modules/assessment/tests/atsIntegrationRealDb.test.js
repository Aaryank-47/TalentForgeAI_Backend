import { describe, test, expect, beforeAll, afterAll, } from "@jest/globals";
import prisma, { closeDatabase } from "../../../config/database.js";
import { AssessmentATSIntegrationService } from "../services/atsIntegration.service.js";
import { AssessmentEvaluationService } from "../services/assessmentEvaluation.service.js";
import { AssessmentAttemptService } from "../services/candidateAssessment.service.js";
import { AttemptStatus, EvaluationStatus, QuestionType, UserRole } from "@prisma/client";
describe("Mode 2: Real Database Assessment ATS Integration Test", () => {
    let candidateUser;
    let employerUser;
    let candidateProfile;
    let company;
    let companyMember;
    let assessment;
    let section;
    let question;
    let attempt;
    let job;
    let application;
    let workflow;
    let stage1;
    let stage2;
    let appWorkflow;
    beforeAll(async () => {
        const testId = `real_ats_${Date.now()}`;
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
                fullName: "Real ATS Candidate"
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
        company = await prisma.company.create({
            data: {
                companyName: `Real ATS Company ${testId}`,
                slug: `real-ats-company-${testId}`,
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
        await prisma.employer.create({
            data: {
                userId: employerUser.id,
                fullName: "Real ATS Employer"
            }
        });
        // Resolve custom Hiring Workflow Stages
        workflow = await prisma.workflow.create({
            data: {
                name: `Workflow ${testId}`,
                companyId: company.id,
                status: "ACTIVE"
            }
        });
        const stageLib1 = await prisma.stageLibrary.create({
            data: { name: `Technical Assessment ${testId}`, type: "CUSTOM", companyId: company.id }
        });
        const stageLib2 = await prisma.stageLibrary.create({
            data: { name: `Technical Interview ${testId}`, type: "CUSTOM", companyId: company.id }
        });
        stage1 = await prisma.workflowStage.create({
            data: { workflowId: workflow.id, stageLibraryId: stageLib1.id, order: 1 }
        });
        stage2 = await prisma.workflowStage.create({
            data: { workflowId: workflow.id, stageLibraryId: stageLib2.id, order: 2 }
        });
        job = await prisma.job.create({
            data: {
                companyId: company.id,
                title: "Software Engineer [Real ATS]",
                slug: `se-real-ats-${testId}`,
                description: "Job description for test",
                employmentType: "FULL_TIME",
                workplaceType: "REMOTE",
                createdById: employerUser.id,
                workflowId: workflow.id
            }
        });
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
        // Initialize active workflow stage
        appWorkflow = await prisma.applicationWorkflow.create({
            data: {
                applicationId: application.id,
                workflowStageId: stage1.id
            }
        });
        assessment = await prisma.assessment.create({
            data: {
                companyId: company.id,
                title: "Real ATS Assessment",
                durationMinutes: 60,
                status: "PUBLISHED",
                passingScore: 50.0,
                createdById: companyMember.id
            }
        });
        section = await prisma.assessmentSection.create({
            data: {
                assessmentId: assessment.id,
                title: "Section 1",
                displayOrder: 1,
                sectionType: QuestionType.MCQ
            }
        });
        question = await prisma.question.create({
            data: {
                title: "Real ATS MCQ Question",
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
        await prisma.$transaction([
            prisma.workflowHistory.deleteMany({ where: { applicationWorkflowId: appWorkflow.id } }),
            prisma.applicationWorkflow.deleteMany({ where: { id: appWorkflow.id } }),
            prisma.assessmentAnswer.deleteMany({ where: { attemptId: attempt.id } }),
            prisma.assessmentAttempt.deleteMany({ where: { id: attempt.id } }),
            prisma.assessmentSectionItem.deleteMany({ where: { sectionId: section.id } }),
            prisma.assessmentSection.deleteMany({ where: { id: section.id } }),
            prisma.question.deleteMany({ where: { id: question.id } }),
            prisma.assessment.deleteMany({ where: { id: assessment.id } }),
            prisma.application.deleteMany({ where: { id: application.id } }),
            prisma.job.deleteMany({ where: { id: job.id } }),
            prisma.workflowStage.deleteMany({ where: { id: { in: [stage1.id, stage2.id] } } }),
            prisma.workflow.deleteMany({ where: { id: workflow.id } }),
            prisma.companyMember.deleteMany({ where: { id: companyMember.id } }),
            prisma.employer.deleteMany({ where: { userId: employerUser.id } }),
            prisma.company.deleteMany({ where: { id: company.id } }),
            prisma.candidate.deleteMany({ where: { id: candidateProfile.id } }),
            prisma.user.deleteMany({ where: { id: { in: [candidateUser.id, employerUser.id] } } })
        ]);
        await closeDatabase();
    });
    test("Candidate evaluation auto stage transition integration test on real DB", async () => {
        // 1. Candidate saves MCQ Answer
        await AssessmentAttemptService.saveAnswer(candidateUser.id, attempt.id, question.id, { selectedOptionIds: [question.mcqDetail.options[0].id] });
        // 2. Candidate submits Assessment Attempt
        await AssessmentAttemptService.submitAttempt(candidateUser.id, attempt.id);
        // 3. Recruiter starts evaluation (which triggers automatic transition upon COMPLETED status)
        await AssessmentEvaluationService.startEvaluation(employerUser.id, attempt.id);
        // Wait a small buffer for async integration tasks
        await new Promise(r => setTimeout(r, 150));
        // 4. Verify candidate workflow stage moved to stage2
        const updatedWorkflow = await prisma.applicationWorkflow.findUnique({
            where: { applicationId: application.id }
        });
        expect(updatedWorkflow?.workflowStageId).toBe(stage2.id);
        // 5. Recruiter retrieves result by application
        const resultRes = await AssessmentATSIntegrationService.getAssessmentResultByApplication(employerUser.id, UserRole.EMPLOYER, application.id);
        expect(resultRes.passed).toBe(true);
        expect(resultRes.percentage).toBe(100.0);
    });
});
//# sourceMappingURL=atsIntegrationRealDb.test.js.map