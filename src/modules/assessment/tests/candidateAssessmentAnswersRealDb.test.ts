import {
    describe,
    test,
    expect,
    beforeAll,
    afterAll,
} from "@jest/globals";
import prisma, { closeDatabase } from "../../../config/database.js";
import { AssessmentAttemptService } from "../services/candidateAssessment.service.js";
import { AttemptStatus } from "@prisma/client";

describe("Mode 2: Real Database Assessment Answers (Get and Clear) Integration Test", () => {
    let candidate: any;
    let job: any;
    let application: any;
    let assessment: any;
    let section: any;
    let question: any;
    let attempt: any;

    beforeAll(async () => {
        // Always create a unique Candidate for this test suite to avoid conflicts with other tests in parallel execution
        const user = await prisma.user.create({
            data: {
                email: `jest-real-db-test-answers-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,
                password: "hashedpassword",
                role: "CANDIDATE",
                status: "ACTIVE"
            }
        });
        candidate = await prisma.candidate.create({
            data: {
                userId: user.id,
                fullName: "Jest Real DB Test Candidate Answers [jest-real-db-test-answers-marker]"
            },
            include: { user: true }
        });

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
        } else {
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
        } else {
            attempt = await prisma.assessmentAttempt.update({
                where: { id: attempt.id },
                data: { startedAt: new Date() }
            });
        }
    });

    afterAll(async () => {
        await closeDatabase();
    });

    test("Execute GET all, GET one, and DELETE answer APIs on real DB", async () => {
        // Print Dependency Summary
        console.log("\n==================================================");
        console.log("REAL DATABASE ASSESSMENT ANSWERS TEST");
        console.log("==================================================");
        console.log(`Candidate ID: ${candidate.id}`);
        console.log(`User ID: ${candidate.user.id}`);
        console.log(`Attempt ID: ${attempt.id}`);
        console.log(`Question ID: ${question.id}`);
        console.log("==================================================\n");

        // 1. Prepare and Save Answer first
        let payload: any;
        if (question.type === "MCQ") {
            const optionId = question.mcqDetail?.options[0]?.id || "dummy_option_id";
            payload = {
                selectedOptionIds: [optionId],
                meta: { source: "jest-real-db-test-answers" }
            };
        } else if (question.type === "DSA") {
            let progLanguage = await prisma.programmingLanguage.findFirst({
                where: { isActive: true }
            });
            if (!progLanguage) {
                progLanguage = await prisma.programmingLanguage.create({
                    data: {
                        name: "C++ [jest-real-db-test-marker]",
                        slug: `cpp-real-answers-${Date.now()}`,
                        isActive: true
                    }
                });
            }
            payload = {
                codeResponse: "class Solution {};",
                meta: {
                    languageId: progLanguage.id,
                    source: "jest-real-db-test-answers"
                }
            };
        } else {
            payload = {
                submissionUrl: "https://github.com/candidate/test-project-answers",
                meta: { source: "jest-real-db-test-answers" }
            };
        }

        // Save answer
        const savedRes = await AssessmentAttemptService.saveAnswer(
            candidate.user.id,
            attempt.id,
            question.id,
            payload
        );
        expect(savedRes.answerId).toBeDefined();

        // 2. GET ALL ANSWERS
        const allAnswers = await AssessmentAttemptService.getAnswers(candidate.user.id, attempt.id);
        expect(allAnswers.length).toBeGreaterThanOrEqual(1);
        const savedAnswerObj = allAnswers.find(a => a.questionId === question.id);
        expect(savedAnswerObj).toBeDefined();
        expect(savedAnswerObj?.answerId).toBe(savedRes.answerId);

        console.log("--- GET ALL ANSWERS SUCCESS ---");
        console.log(`Total answers retrieved: ${allAnswers.length}\n`);

        // 3. GET ONE ANSWER
        const singleAnswer = await AssessmentAttemptService.getAnswer(candidate.user.id, attempt.id, question.id);
        expect(singleAnswer).toBeDefined();
        expect(singleAnswer.answerId).toBe(savedRes.answerId);

        console.log("--- GET ONE ANSWER SUCCESS ---");
        console.log(`Answer ID: ${singleAnswer.answerId}\n`);

        // 4. DELETE ANSWER
        const deleteRes = await AssessmentAttemptService.clearAnswer(candidate.user.id, attempt.id, question.id);
        expect(deleteRes.attemptId).toBe(attempt.id);
        expect(deleteRes.questionId).toBe(question.id);

        console.log("--- CLEAR/DELETE ANSWER SUCCESS ---\n");

        // 5. VERIFY DELETION (GET should now return 404/throw NotFoundError)
        await expect(
            AssessmentAttemptService.getAnswer(candidate.user.id, attempt.id, question.id)
        ).rejects.toThrow();
    });
});
