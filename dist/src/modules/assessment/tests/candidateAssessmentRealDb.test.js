import { describe, test, expect, beforeAll, afterAll, } from "@jest/globals";
import prisma, { closeDatabase } from "../../../config/database.js";
import { AssessmentAttemptService } from "../services/candidateAssessment.service.js";
import { AttemptStatus } from "@prisma/client";
describe("Mode 2: Real Database Assessment Answer Save/Autosave Integration Test", () => {
    let candidate;
    let job;
    let application;
    let assessment;
    let section;
    let question;
    let attempt;
    beforeAll(async () => {
        // Resolve Candidate
        candidate = await prisma.candidate.findFirst({
            include: { user: true }
        });
        if (!candidate) {
            const user = await prisma.user.create({
                data: {
                    email: `jest-real-db-test-${Date.now()}@example.com`,
                    password: "hashedpassword",
                    role: "CANDIDATE",
                    status: "ACTIVE"
                }
            });
            candidate = await prisma.candidate.create({
                data: {
                    userId: user.id,
                    fullName: "Jest Real DB Test Candidate [jest-real-db-test-marker]"
                },
                include: { user: true }
            });
        }
        // Resolve Job
        job = await prisma.job.findFirst();
        if (!job) {
            let company = await prisma.company.findFirst();
            if (!company) {
                company = await prisma.company.create({
                    data: {
                        companyName: `Jest Real DB Test Company ${Date.now()}`,
                        slug: `jest-real-company-${Date.now()}`,
                        status: "ACTIVE"
                    }
                });
            }
            job = await prisma.job.create({
                data: {
                    companyId: company.id,
                    title: "Software Engineer [jest-real-db-test-marker]",
                    slug: `se-jest-real-${Date.now()}`,
                    description: "Job description for test",
                    employmentType: "FULL_TIME",
                    workplaceType: "REMOTE",
                    createdById: candidate.userId
                }
            });
        }
        // Resolve Application
        application = await prisma.application.findFirst({
            where: { candidateId: candidate.id }
        });
        if (!application) {
            let resume = await prisma.resume.findFirst({
                where: { candidateId: candidate.id }
            });
            if (!resume) {
                resume = await prisma.resume.create({
                    data: {
                        candidateId: candidate.id,
                        resumeName: "My Resume",
                        resumeUrl: "http://example.com/resume.pdf",
                        fileSize: 1024
                    }
                });
            }
            application = await prisma.application.create({
                data: {
                    candidateId: candidate.id,
                    jobId: job.id,
                    resumeId: resume.id,
                    status: "APPLIED"
                }
            });
        }
        // Resolve Assessment
        assessment = await prisma.assessment.findFirst({
            where: { status: "PUBLISHED" }
        });
        if (!assessment) {
            let company = await prisma.company.findFirst();
            if (!company) {
                company = await prisma.company.create({
                    data: {
                        companyName: `Jest Real DB Test Company ${Date.now()}`,
                        slug: `jest-real-company-${Date.now()}`,
                        status: "ACTIVE"
                    }
                });
            }
            let companyMember = await prisma.companyMember.findFirst({
                where: { companyId: company.id }
            });
            if (!companyMember) {
                companyMember = await prisma.companyMember.create({
                    data: {
                        userId: candidate.userId,
                        companyId: company.id,
                        role: "OWNER"
                    }
                });
            }
            assessment = await prisma.assessment.create({
                data: {
                    companyId: company.id,
                    title: "Backend Dev Assessment [jest-real-db-test-marker]",
                    durationMinutes: 60,
                    status: "PUBLISHED",
                    createdById: companyMember.id
                }
            });
        }
        // Resolve Assessment Section
        section = await prisma.assessmentSection.findFirst({
            where: { assessmentId: assessment.id }
        });
        if (!section) {
            section = await prisma.assessmentSection.create({
                data: {
                    assessmentId: assessment.id,
                    title: "Section 1 [jest-real-db-test-marker]",
                    displayOrder: 1,
                    sectionType: "MCQ"
                }
            });
        }
        // Resolve Question and Section Item link
        let sectionItem = await prisma.assessmentSectionItem.findFirst({
            where: { sectionId: section.id },
            include: { question: { include: { mcqDetail: { include: { options: true } } } } }
        });
        if (sectionItem) {
            question = sectionItem.question;
        }
        else {
            question = await prisma.question.create({
                data: {
                    title: "MCQ Question [jest-real-db-test-marker]",
                    description: "Select correct answer",
                    type: "MCQ",
                    difficulty: "EASY",
                    estimatedTime: 10,
                    defaultMarks: 5.0,
                    ownership: "COMPANY",
                    companyId: assessment.companyId,
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
        }
        // Resolve Assessment Attempt
        attempt = await prisma.assessmentAttempt.findFirst({
            where: {
                candidateId: candidate.id,
                assessmentId: assessment.id,
                status: AttemptStatus.IN_PROGRESS
            }
        });
        if (attempt) {
            attempt = await prisma.assessmentAttempt.update({
                where: { id: attempt.id },
                data: { startedAt: new Date() }
            });
        }
        if (!attempt) {
            attempt = await prisma.assessmentAttempt.create({
                data: {
                    candidateId: candidate.id,
                    applicationId: application.id,
                    assessmentId: assessment.id,
                    status: AttemptStatus.IN_PROGRESS,
                    startedAt: new Date()
                }
            });
        }
    });
    afterAll(async () => {
        // No cleanup/deletions here to persist output records
        await closeDatabase();
    });
    test("Execute saveAnswer for CREATE and UPDATE on real DB", async () => {
        // Print Dependency Summary
        console.log("\n==================================================");
        console.log("REAL DATABASE SAVEANSWER TEST");
        console.log("==================================================");
        console.log("Dependency summary:");
        console.log(`Candidate ID: ${candidate.id}`);
        console.log(`User ID: ${candidate.userId}`);
        console.log(`Job ID: ${job.id}`);
        console.log(`Application ID: ${application.id}`);
        console.log(`Assessment ID: ${assessment.id}`);
        console.log(`Section ID: ${section.id}`);
        console.log(`Question ID: ${question.id} (Type: ${question.type})`);
        console.log(`Attempt ID: ${attempt.id}`);
        console.log("==================================================\n");
        // Construct valid payload
        let payload;
        if (question.type === "MCQ") {
            const optionId = question.mcqDetail?.options[0]?.id || "dummy_option_id";
            payload = {
                selectedOptionIds: [optionId],
                meta: { source: "jest-real-db-test", test: "saveAnswer" }
            };
        }
        else if (question.type === "DSA") {
            let progLanguage = await prisma.programmingLanguage.findFirst({
                where: { isActive: true }
            });
            if (!progLanguage) {
                progLanguage = await prisma.programmingLanguage.create({
                    data: {
                        name: "C++ [jest-real-db-test-marker]",
                        slug: `cpp-real-${Date.now()}`,
                        isActive: true
                    }
                });
            }
            payload = {
                codeResponse: "class Solution {};",
                meta: {
                    languageId: progLanguage.id,
                    source: "jest-real-db-test",
                    test: "saveAnswer"
                }
            };
        }
        else {
            payload = {
                submissionUrl: "https://github.com/candidate/test-project",
                meta: { source: "jest-real-db-test", test: "saveAnswer" }
            };
        }
        // 1. FIRST SAVE (CREATE)
        const resultCreate = await AssessmentAttemptService.saveAnswer(candidate.user.id, attempt.id, question.id, payload);
        expect(resultCreate.answerId).toBeDefined();
        expect(resultCreate.attemptId).toBe(attempt.id);
        expect(resultCreate.questionId).toBe(question.id);
        console.log("\n--- FIRST SAVE (CREATE) SUCCESS ---");
        console.log(`assessmentAnswerId: ${resultCreate.answerId}`);
        console.log(`attemptId: ${resultCreate.attemptId}`);
        console.log(`questionId: ${resultCreate.questionId}`);
        console.log("operation: CREATE\n");
        // Verify in DB
        const savedAnswer1 = await prisma.assessmentAnswer.findUnique({
            where: { id: resultCreate.answerId }
        });
        expect(savedAnswer1).not.toBeNull();
        expect(savedAnswer1?.attemptId).toBe(attempt.id);
        expect(savedAnswer1?.questionId).toBe(question.id);
        // 2. SECOND SAVE (UPDATE/AUTOSAVE)
        let updatedPayload;
        if (question.type === "MCQ") {
            updatedPayload = {
                selectedOptionIds: [], // clear answer
                meta: { source: "jest-real-db-test", test: "saveAnswer", updated: true }
            };
        }
        else if (question.type === "DSA") {
            updatedPayload = {
                codeResponse: "class Solution { // updated };",
                meta: {
                    ...payload.meta,
                    updated: true
                }
            };
        }
        else {
            updatedPayload = {
                submissionUrl: "https://github.com/candidate/test-project-updated",
                meta: { source: "jest-real-db-test", test: "saveAnswer", updated: true }
            };
        }
        const resultUpdate = await AssessmentAttemptService.saveAnswer(candidate.user.id, attempt.id, question.id, updatedPayload);
        expect(resultUpdate.answerId).toBe(resultCreate.answerId);
        expect(resultUpdate.attemptId).toBe(attempt.id);
        expect(resultUpdate.questionId).toBe(question.id);
        console.log("\n--- SECOND SAVE (UPDATE) SUCCESS ---");
        console.log(`assessmentAnswerId: ${resultUpdate.answerId}`);
        console.log(`attemptId: ${resultUpdate.attemptId}`);
        console.log(`questionId: ${resultUpdate.questionId}`);
        console.log("operation: UPDATE\n");
        // Verify update in DB
        const savedAnswer2 = await prisma.assessmentAnswer.findUnique({
            where: { id: resultUpdate.answerId }
        });
        expect(savedAnswer2).not.toBeNull();
        if (question.type === "MCQ") {
            expect(savedAnswer2?.selectedOptionIds).toEqual([]);
        }
        else if (question.type === "DSA") {
            expect(savedAnswer2?.codeResponse).toBe("class Solution { // updated };");
        }
        else {
            expect(savedAnswer2?.submissionUrl).toBe("https://github.com/candidate/test-project-updated");
        }
    });
});
//# sourceMappingURL=candidateAssessmentRealDb.test.js.map