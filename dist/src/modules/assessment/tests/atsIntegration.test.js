import { describe, test, expect, beforeAll, afterAll, } from "@jest/globals";
import prisma, { closeDatabase } from "../../../config/database.js";
import { AssessmentATSIntegrationService, AssessmentOutcomeService } from "../services/atsIntegration.service.js";
import { AttemptStatus, EvaluationStatus, QuestionType, UserRole } from "@prisma/client";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ForbiddenError } from "../../../common/errors/ForbiddenError.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { ApplicationStatus } from "../../../common/enums/all_enums.js";
describe("Assessment ATS Integration Unit Tests", () => {
    let candidateUser;
    let candidate2User;
    let employerUser;
    let candidateProfile;
    let company;
    let companyMember;
    let assessment;
    let job;
    let application;
    let workflow;
    let stage1;
    let stage2;
    let appWorkflow;
    let passedAttempt;
    let failedAttempt;
    let inProgressAttempt;
    beforeAll(async () => {
        const testId = `test_ats_${Date.now()}`;
        candidateUser = await prisma.user.create({
            data: {
                email: `cand1_${testId}@example.com`,
                password: "hashedpassword",
                role: UserRole.CANDIDATE,
                status: "ACTIVE"
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
        candidateProfile = await prisma.candidate.create({
            data: {
                userId: candidateUser.id,
                fullName: "ATS Candidate One"
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
        company = await prisma.company.create({
            data: {
                companyName: `ATS Test Company ${testId}`,
                slug: `ats-test-company-${testId}`,
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
        await prisma.employer.create({
            data: {
                userId: employerUser.id,
                fullName: "ATS Employer Evaluator"
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
                title: "Backend Engineer",
                slug: `be-ats-${testId}`,
                description: "Job description",
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
                title: "ATS Assessment Evaluator",
                durationMinutes: 60,
                status: "PUBLISHED",
                passingScore: 50.0,
                createdById: companyMember.id
            }
        });
        // 1. PASSED Attempt
        passedAttempt = await prisma.assessmentAttempt.create({
            data: {
                candidateId: candidateProfile.id,
                applicationId: application.id,
                assessmentId: assessment.id,
                status: AttemptStatus.SUBMITTED,
                evaluationStatus: EvaluationStatus.COMPLETED,
                overallScore: 80.0,
                percentage: 80.0,
                passed: true,
                submittedAt: new Date()
            }
        });
        // 2. FAILED Attempt
        failedAttempt = await prisma.assessmentAttempt.create({
            data: {
                candidateId: candidateProfile.id,
                applicationId: application.id,
                assessmentId: assessment.id,
                status: AttemptStatus.SUBMITTED,
                evaluationStatus: EvaluationStatus.COMPLETED,
                overallScore: 30.0,
                percentage: 30.0,
                passed: false,
                submittedAt: new Date()
            }
        });
        // 3. IN_PROGRESS Attempt
        inProgressAttempt = await prisma.assessmentAttempt.create({
            data: {
                candidateId: candidateProfile.id,
                applicationId: application.id,
                assessmentId: assessment.id,
                status: AttemptStatus.IN_PROGRESS,
                evaluationStatus: EvaluationStatus.PENDING
            }
        });
    });
    afterAll(async () => {
        await prisma.$transaction([
            prisma.workflowHistory.deleteMany({ where: { applicationWorkflowId: appWorkflow.id } }),
            prisma.applicationWorkflow.deleteMany({ where: { id: appWorkflow.id } }),
            prisma.assessmentAttempt.deleteMany({ where: { id: { in: [passedAttempt.id, failedAttempt.id, inProgressAttempt.id] } } }),
            prisma.assessment.deleteMany({ where: { id: assessment.id } }),
            prisma.application.deleteMany({ where: { id: application.id } }),
            prisma.job.deleteMany({ where: { id: job.id } }),
            prisma.workflowStage.deleteMany({ where: { id: { in: [stage1.id, stage2.id] } } }),
            prisma.workflow.deleteMany({ where: { id: workflow.id } }),
            prisma.companyMember.deleteMany({ where: { id: companyMember.id } }),
            prisma.employer.deleteMany({ where: { userId: employerUser.id } }),
            prisma.company.deleteMany({ where: { id: company.id } }),
            prisma.candidate.deleteMany({ where: { id: candidateProfile.id } }),
            prisma.user.deleteMany({ where: { id: { in: [candidateUser.id, candidate2User.id, employerUser.id] } } })
        ]);
        await closeDatabase();
    });
    describe("GET /api/v1/applications/:applicationId/assessment-result", () => {
        test("Succeeds to retrieve completed result for candidate's own application", async () => {
            const res = await AssessmentATSIntegrationService.getAssessmentResultByApplication(candidateUser.id, UserRole.CANDIDATE, application.id);
            expect(res.applicationId).toBe(application.id);
            expect(res.percentage).toBeDefined();
            expect(res.evaluationStatus).toBe(EvaluationStatus.COMPLETED);
        });
        test("Throws ForbiddenError if other candidate requests result", async () => {
            await expect(AssessmentATSIntegrationService.getAssessmentResultByApplication(candidate2User.id, UserRole.CANDIDATE, application.id)).rejects.toThrow(ForbiddenError);
        });
        test("Succeeds if employer of same company requests result", async () => {
            const res = await AssessmentATSIntegrationService.getAssessmentResultByApplication(employerUser.id, UserRole.EMPLOYER, application.id);
            expect(res.passed).toBeDefined();
        });
    });
    describe("AssessmentOutcomeService.determineOutcome", () => {
        test("Succeeds with PASSED outcome when percentage >= passingScore", async () => {
            const res = await AssessmentOutcomeService.determineOutcome(passedAttempt.id);
            expect(res.outcome).toBe("PASSED");
            expect(res.action).toBe("MOVE_TO_NEXT_STAGE");
        });
        test("Succeeds with FAILED outcome when percentage < passingScore", async () => {
            const res = await AssessmentOutcomeService.determineOutcome(failedAttempt.id);
            expect(res.outcome).toBe("FAILED");
            expect(res.action).toBe("REJECT_APPLICATION");
        });
        test("Throws ConflictError if attempt is still IN_PROGRESS", async () => {
            await expect(AssessmentOutcomeService.determineOutcome(inProgressAttempt.id)).rejects.toThrow(ConflictError);
        });
    });
    describe("AssessmentATSIntegrationService.processAssessmentResult", () => {
        test("Moves candidate to next workflow stage when passed", async () => {
            // Set workflow stage back to stage 1 to test transition
            await prisma.applicationWorkflow.update({
                where: { id: appWorkflow.id },
                data: { workflowStageId: stage1.id }
            });
            const res = await AssessmentATSIntegrationService.processAssessmentResult(passedAttempt.id);
            expect(res.result).toBe("PASSED");
            expect(res.action).toBe("MOVE_TO_NEXT_STAGE");
            expect(res.nextStageId).toBe(stage2.id);
            const updatedAppWorkflow = await prisma.applicationWorkflow.findUnique({
                where: { applicationId: application.id }
            });
            expect(updatedAppWorkflow?.workflowStageId).toBe(stage2.id);
        });
        test("Rejects application and logs history when failed", async () => {
            // Reset application stage and status to test rejection
            await prisma.applicationWorkflow.update({
                where: { id: appWorkflow.id },
                data: { workflowStageId: stage1.id }
            });
            await prisma.application.update({
                where: { id: application.id },
                data: { status: "APPLIED" }
            });
            const res = await AssessmentATSIntegrationService.processAssessmentResult(failedAttempt.id);
            expect(res.result).toBe("FAILED");
            expect(res.action).toBe("REJECT_APPLICATION");
            expect(res.nextStageId).toBeNull();
            const updatedApp = await prisma.application.findUnique({
                where: { id: application.id }
            });
            expect(updatedApp?.status).toBe("REJECTED");
            const histories = await prisma.workflowHistory.findMany({
                where: { applicationWorkflowId: appWorkflow.id }
            });
            expect(histories.length).toBeGreaterThan(0);
        });
    });
});
//# sourceMappingURL=atsIntegration.test.js.map