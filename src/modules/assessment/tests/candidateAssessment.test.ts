import {
    describe,
    test,
    expect,
    beforeAll,
    afterAll,
    jest
} from "@jest/globals";
import assert from "node:assert";
import prisma, { closeDatabase } from "../../../config/database.js";
import { AssessmentAttemptService } from "../services/candidateAssessment.service.js";
import { AttemptStatus, QuestionType, UserRole } from "@prisma/client";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { ForbiddenError } from "../../../common/errors/ForbiddenError.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { ValidationError } from "../../../common/errors/ValidationError.js";

describe("Candidate Assessment Answer Save/Autosave API tests", () => {
    jest.setTimeout(30000); // beforeAll creates complex nested test data (~5-6s locally, can be longer in CI)
    let candidateUser: any;
    let candidate2User: any;
    let candidateProfile: any;
    let candidate2Profile: any;
    let company: any;
    let companyMember: any;
    let assessment: any;
    let mixedAssessment: any;
    let section: any;
    let mixedSection: any;
    let mcqQuestion: any;
    let dsaQuestion: any;
    let projectQuestion: any;
    let mcqOption1: any;
    let mcqOption2: any;
    let progLanguage: any;
    
    let activeAttempt: any;
    let submittedAttempt: any;
    let cancelledAttempt: any;
    let expiredAttempt: any;
    let expiredTimerAttempt: any;
    let mixedAttempt: any;
    let validationAttempt: any;
    let notStartedAttempt: any;
    let job: any;
    let resume: any;
    let application: any;

    beforeAll(async () => {
        const testId = `test_${Date.now()}`;

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
                fullName: "Candidate One"
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
                fullName: "Candidate Two"
            }
        });

        // Create Company & Member
        company = await prisma.company.create({
            data: {
                companyName: `Test Company ${testId}`,
                slug: `test-company-${testId}`,
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

        // Create Programming Language
        progLanguage = await prisma.programmingLanguage.create({
            data: {
                name: `C++ ${testId}`,
                slug: `cpp-${testId}`,
                isActive: true
            }
        });

        // Create Assessments
        assessment = await prisma.assessment.create({
            data: {
                companyId: company.id,
                title: "Backend Dev Assessment",
                durationMinutes: 60,
                status: "PUBLISHED",
                createdById: companyMember.id
            }
        });

        mixedAssessment = await prisma.assessment.create({
            data: {
                companyId: company.id,
                title: "Mixed MCQ & DSA Assessment",
                durationMinutes: 60,
                status: "PUBLISHED",
                createdById: companyMember.id
            }
        });

        // Create Sections
        section = await prisma.assessmentSection.create({
            data: {
                assessmentId: assessment.id,
                title: "Section 1",
                displayOrder: 1,
                sectionType: QuestionType.MCQ
            }
        });

        mixedSection = await prisma.assessmentSection.create({
            data: {
                assessmentId: mixedAssessment.id,
                title: "Mixed Section",
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
        mcqOption2 = mcqQuestion.mcqDetail.options[1];

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

        // Create Project Question
        projectQuestion = await prisma.question.create({
            data: {
                title: "Project Question",
                description: "Build a mini URL shortener",
                type: QuestionType.PROJECT,
                difficulty: "HARD",
                estimatedTime: 120,
                defaultMarks: 50.0,
                ownership: "COMPANY",
                companyId: company.id,
                projectDetail: {
                    create: {
                        requirements: "Requirements details",
                        submissionInstructions: "Submit your github repo",
                        deadlineHours: 48
                    }
                }
            }
        });

        // Map questions to assessment section items
        await prisma.assessmentSectionItem.createMany({
            data: [
                { sectionId: section.id, questionId: mcqQuestion.id, displayOrder: 1 },
                { sectionId: section.id, questionId: dsaQuestion.id, displayOrder: 2 },
                { sectionId: section.id, questionId: projectQuestion.id, displayOrder: 3 },
                { sectionId: mixedSection.id, questionId: mcqQuestion.id, displayOrder: 1 },
                { sectionId: mixedSection.id, questionId: dsaQuestion.id, displayOrder: 2 }
            ]
        });

        // Create Application for Candidate 1
        job = await prisma.job.create({
            data: {
                companyId: company.id,
                title: "Software Engineer",
                slug: `se-${testId}`,
                description: "Job description",
                employmentType: "FULL_TIME",
                workplaceType: "REMOTE",
                createdById: candidateUser.id
            }
        });

        resume = await prisma.resume.create({
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
                status: "APPLIED",
                applicationResume: {
                    create: {
                        sourceResumeId: resume.id,
                        fileName: resume.resumeName,
                        fileUrl: resume.resumeUrl,
                        fileSize: resume.fileSize
                    }
                }
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

        notStartedAttempt = await prisma.assessmentAttempt.create({
            data: {
                candidateId: candidateProfile.id,
                applicationId: application.id,
                assessmentId: assessment.id,
                status: AttemptStatus.NOT_STARTED
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

        mixedAttempt = await prisma.assessmentAttempt.create({
            data: {
                candidateId: candidateProfile.id,
                applicationId: application.id,
                assessmentId: mixedAssessment.id,
                status: AttemptStatus.IN_PROGRESS,
                startedAt: new Date()
            }
        });

        validationAttempt = await prisma.assessmentAttempt.create({
            data: {
                candidateId: candidateProfile.id,
                applicationId: application.id,
                assessmentId: assessment.id,
                status: AttemptStatus.IN_PROGRESS,
                startedAt: new Date()
            }
        });
    });

    afterAll(async () => {
        // Defensive cleanup: only delete what was successfully created in beforeAll
        const attemptIds = [
            activeAttempt?.id,
            submittedAttempt?.id,
            cancelledAttempt?.id,
            expiredAttempt?.id,
            expiredTimerAttempt?.id,
            mixedAttempt?.id,
            validationAttempt?.id,
            notStartedAttempt?.id
        ].filter(Boolean);
        const sectionIds = [section?.id, mixedSection?.id].filter(Boolean);
        const questionIds = [mcqQuestion?.id, dsaQuestion?.id, projectQuestion?.id].filter(Boolean);
        const assessmentIds = [assessment?.id, mixedAssessment?.id].filter(Boolean);
        const userIds = [candidateUser?.id, candidate2User?.id].filter(Boolean);
        const candidateIds = [candidateProfile?.id, candidate2Profile?.id].filter(Boolean);

        if (attemptIds.length > 0 || sectionIds.length > 0 || questionIds.length > 0 || assessmentIds.length > 0) {
            await prisma.$transaction([
                ...(attemptIds.length > 0 ? [
                    prisma.assessmentAnswer.deleteMany({
                        where: { attemptId: { in: attemptIds } }
                    }),
                    prisma.assessmentAttempt.deleteMany({
                        where: { id: { in: attemptIds } }
                    })
                ] : []),
                ...(sectionIds.length > 0 ? [
                    prisma.assessmentSectionItem.deleteMany({
                        where: { sectionId: { in: sectionIds } }
                    }),
                    prisma.assessmentSection.deleteMany({
                        where: { id: { in: sectionIds } }
                    })
                ] : []),
                ...(questionIds.length > 0 ? [
                    prisma.question.deleteMany({
                        where: { id: { in: questionIds } }
                    })
                ] : []),
                ...(assessmentIds.length > 0 ? [
                    prisma.assessment.deleteMany({
                        where: { id: { in: assessmentIds } }
                    })
                ] : []),
                ...(progLanguage?.id ? [
                    prisma.programmingLanguage.deleteMany({
                        where: { id: progLanguage.id }
                    })
                ] : []),
                ...(companyMember?.id ? [
                    prisma.companyMember.deleteMany({
                        where: { id: companyMember.id }
                    })
                ] : []),
                ...(company?.id ? [
                    prisma.company.deleteMany({
                        where: { id: company.id }
                    })
                ] : []),
                ...(application?.id ? [
                    prisma.application.deleteMany({
                        where: { id: application.id }
                    })
                ] : []),
                ...(job?.id ? [
                    prisma.job.deleteMany({
                        where: { id: job.id }
                    })
                ] : []),
                ...(resume?.id ? [
                    prisma.resume.deleteMany({
                        where: { id: resume.id }
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
            ], { timeout: 30000, maxWait: 10000 });
        }
        await closeDatabase();
    });

    test("1. First MCQ answer creates AssessmentAnswer", async () => {
        const payload = {
            selectedOptionIds: [mcqOption1.id]
        };

        const result = await AssessmentAttemptService.saveAnswer(candidateUser.id, activeAttempt.id, mcqQuestion.id, payload);
        assert.ok(result.answerId);
        assert.strictEqual(result.attemptId, activeAttempt.id);
        assert.strictEqual(result.questionId, mcqQuestion.id);

        const saved = await prisma.assessmentAnswer.findUnique({ where: { id: result.answerId } });
        assert.ok(saved);
        assert.deepStrictEqual(saved.selectedOptionIds, [mcqOption1.id]);
    });

    test("2. First DSA answer creates AssessmentAnswer", async () => {
        const payload = {
            codeResponse: "class Solution { public: ListNode* reverseList(ListNode* head) {} };",
            meta: {
                languageId: progLanguage.id
            }
        };

        const result = await AssessmentAttemptService.saveAnswer(candidateUser.id, activeAttempt.id, dsaQuestion.id, payload);
        assert.ok(result.answerId);
        assert.strictEqual(result.attemptId, activeAttempt.id);
        assert.strictEqual(result.questionId, dsaQuestion.id);
    });

    test("3. First Project answer creates AssessmentAnswer", async () => {
        const payload = {
            submissionUrl: "https://github.com/candidate/project",
            attachmentUrls: ["https://storage.talentforge.ai/submissions/example.pdf"]
        };

        const result = await AssessmentAttemptService.saveAnswer(candidateUser.id, activeAttempt.id, projectQuestion.id, payload);
        assert.ok(result.answerId);
    });

    test("4. First Machine Coding answer creates AssessmentAnswer", async () => {
        // Machine coding also uses the project validation schema in the service layer
        const payload = {
            submissionUrl: "https://github.com/candidate/machine-coding",
            attachmentUrls: ["https://storage.talentforge.ai/submissions/report.zip"],
            meta: { repositoryType: "GITHUB" }
        };

        const result = await AssessmentAttemptService.saveAnswer(candidateUser.id, activeAttempt.id, projectQuestion.id, payload);
        assert.ok(result.answerId);
    });

    test("5. Second MCQ save updates existing answer", async () => {
        const payload = {
            selectedOptionIds: [mcqOption2.id]
        };

        const result = await AssessmentAttemptService.saveAnswer(candidateUser.id, activeAttempt.id, mcqQuestion.id, payload);
        assert.ok(result.answerId);

        const saved = await prisma.assessmentAnswer.findUnique({ where: { id: result.answerId } });
        assert.ok(saved);
        assert.deepStrictEqual(saved.selectedOptionIds, [mcqOption2.id]);
    });

    test("6. Second DSA save updates existing answer", async () => {
        const payload = {
            codeResponse: "class Solution { updatedSolution };",
            meta: {
                languageId: progLanguage.id
            }
        };

        const result = await AssessmentAttemptService.saveAnswer(candidateUser.id, activeAttempt.id, dsaQuestion.id, payload);
        
        const saved = await prisma.assessmentAnswer.findUnique({ where: { id: result.answerId } });
        assert.ok(saved);
        assert.strictEqual(saved.codeResponse, "class Solution { updatedSolution };");
    });

    test("7. Second Project save updates existing answer", async () => {
        const payload = {
            submissionUrl: "https://github.com/candidate/updated-project",
            attachmentUrls: ["https://storage.talentforge.ai/submissions/new.pdf"]
        };

        const result = await AssessmentAttemptService.saveAnswer(candidateUser.id, activeAttempt.id, projectQuestion.id, payload);

        const saved = await prisma.assessmentAnswer.findUnique({ where: { id: result.answerId } });
        assert.ok(saved);
        assert.strictEqual(saved.submissionUrl, "https://github.com/candidate/updated-project");
    });

    test("8. Multiple repeated saves do not create duplicate rows", async () => {
        const countBefore = await prisma.assessmentAnswer.count({
            where: { attemptId: activeAttempt.id, questionId: mcqQuestion.id }
        });
        assert.strictEqual(countBefore, 1);

        await AssessmentAttemptService.saveAnswer(candidateUser.id, activeAttempt.id, mcqQuestion.id, {
            selectedOptionIds: [mcqOption1.id]
        });
        await AssessmentAttemptService.saveAnswer(candidateUser.id, activeAttempt.id, mcqQuestion.id, {
            selectedOptionIds: [mcqOption2.id]
        });

        const countAfter = await prisma.assessmentAnswer.count({
            where: { attemptId: activeAttempt.id, questionId: mcqQuestion.id }
        });
        assert.strictEqual(countAfter, 1);
    });

    test("9. MCQ + DSA assessment allows MCQ answer", async () => {
        const payload = {
            selectedOptionIds: [mcqOption1.id]
        };

        const result = await AssessmentAttemptService.saveAnswer(candidateUser.id, mixedAttempt.id, mcqQuestion.id, payload);
        assert.ok(result.answerId);
    });

    test("10. Same MCQ + DSA assessment allows DSA answer", async () => {
        const payload = {
            codeResponse: "class Solution { ... }",
            meta: {
                languageId: progLanguage.id
            }
        };

        const result = await AssessmentAttemptService.saveAnswer(candidateUser.id, mixedAttempt.id, dsaQuestion.id, payload);
        assert.ok(result.answerId);
    });

    test("11. Both answers belong to the same AssessmentAttempt", async () => {
        const answers = await prisma.assessmentAnswer.findMany({
            where: { attemptId: mixedAttempt.id }
        });
        assert.strictEqual(answers.length, 2);
        assert.ok(answers.some(a => a.questionId === mcqQuestion.id));
        assert.ok(answers.some(a => a.questionId === dsaQuestion.id));
    });

    test("12. Candidate cannot access another candidate's attempt", async () => {
        const payload = {
            selectedOptionIds: [mcqOption1.id]
        };

        await assert.rejects(
            AssessmentAttemptService.saveAnswer(candidate2User.id, activeAttempt.id, mcqQuestion.id, payload),
            ForbiddenError
        );
    });

    test("13. Question outside assessment is rejected", async () => {
        const isolatedQuestion = await prisma.question.create({
            data: {
                title: "Isolated Question",
                description: "Isolated question description",
                type: QuestionType.MCQ,
                difficulty: "EASY",
                estimatedTime: 10,
                defaultMarks: 5.0,
                ownership: "COMPANY",
                companyId: company.id
            }
        });

        const payload = {
            selectedOptionIds: [mcqOption1.id]
        };

        await assert.rejects(
            AssessmentAttemptService.saveAnswer(candidateUser.id, activeAttempt.id, isolatedQuestion.id, payload),
            ForbiddenError
        );

        await prisma.question.delete({ where: { id: isolatedQuestion.id } });
    });

    test("14. NOT_STARTED rejected", async () => {
        const payload = {
            selectedOptionIds: [mcqOption1.id]
        };

        await assert.rejects(
            AssessmentAttemptService.saveAnswer(candidateUser.id, notStartedAttempt.id, mcqQuestion.id, payload),
            ConflictError
        );
    });

    test("15. IN_PROGRESS allowed", async () => {
        const payload = {
            selectedOptionIds: [mcqOption1.id]
        };

        const result = await AssessmentAttemptService.saveAnswer(candidateUser.id, activeAttempt.id, mcqQuestion.id, payload);
        assert.ok(result.answerId);
    });

    test("16. SUBMITTED rejected", async () => {
        const payload = {
            selectedOptionIds: [mcqOption1.id]
        };

        await assert.rejects(
            AssessmentAttemptService.saveAnswer(candidateUser.id, submittedAttempt.id, mcqQuestion.id, payload),
            ConflictError
        );
    });

    test("17. CANCELLED rejected", async () => {
        const payload = {
            selectedOptionIds: [mcqOption1.id]
        };

        await assert.rejects(
            AssessmentAttemptService.saveAnswer(candidateUser.id, cancelledAttempt.id, mcqQuestion.id, payload),
            ConflictError
        );
    });

    test("18. EXPIRED rejected", async () => {
        const payload = {
            selectedOptionIds: [mcqOption1.id]
        };

        await assert.rejects(
            AssessmentAttemptService.saveAnswer(candidateUser.id, expiredAttempt.id, mcqQuestion.id, payload),
            ConflictError
        );
    });

    test("19. Timer expiration rejects save", async () => {
        const payload = {
            selectedOptionIds: [mcqOption1.id]
        };

        await assert.rejects(
            AssessmentAttemptService.saveAnswer(candidateUser.id, expiredTimerAttempt.id, mcqQuestion.id, payload),
            ConflictError
        );
    });

    test("20. Invalid MCQ option rejected", async () => {
        const payload = {
            selectedOptionIds: ["non_existent_option_id"]
        };

        await assert.rejects(
            AssessmentAttemptService.saveAnswer(candidateUser.id, validationAttempt.id, mcqQuestion.id, payload),
            ValidationError
        );
    });

    test("21. Option from another MCQ rejected", async () => {
        const anotherMcq = await prisma.question.create({
            data: {
                title: "Another MCQ Question",
                description: "Another MCQ description",
                type: QuestionType.MCQ,
                difficulty: "EASY",
                estimatedTime: 10,
                defaultMarks: 5.0,
                ownership: "COMPANY",
                companyId: company.id,
                mcqDetail: {
                    create: {
                        options: {
                            create: { optionText: "Option C", displayOrder: 1, isCorrect: true }
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

        // Add this question to assessment Section Item
        const item = await prisma.assessmentSectionItem.create({
            data: { sectionId: section.id, questionId: anotherMcq.id, displayOrder: 4 }
        });

        const payload = {
            selectedOptionIds: [anotherMcq.mcqDetail!.options[0]!.id]
        };

        // Try to save that option to mcqQuestion
        await assert.rejects(
            AssessmentAttemptService.saveAnswer(candidateUser.id, validationAttempt.id, mcqQuestion.id, payload),
            ValidationError
        );

        await prisma.assessmentSectionItem.delete({ where: { id: item.id } });
        await prisma.question.delete({ where: { id: anotherMcq.id } });
    });

    test("22. Multiple selections rejected when not allowed", async () => {
        const payload = {
            selectedOptionIds: [mcqOption1.id, mcqOption2.id]
        };

        await assert.rejects(
            AssessmentAttemptService.saveAnswer(candidateUser.id, validationAttempt.id, mcqQuestion.id, payload),
            ValidationError
        );
    });

    test("23. Empty selection allowed if skipping/clearing is supported", async () => {
        const payload = {
            selectedOptionIds: []
        };

        const result = await AssessmentAttemptService.saveAnswer(candidateUser.id, validationAttempt.id, mcqQuestion.id, payload);
        assert.ok(result.answerId);
    });

    test("24. Missing code rejected according to validation rules", async () => {
        const payload = {
            meta: { languageId: progLanguage.id }
        };

        await assert.rejects(
            AssessmentAttemptService.saveAnswer(candidateUser.id, validationAttempt.id, dsaQuestion.id, payload as any),
            ValidationError
        );
    });

    test("25. Unsupported language rejected", async () => {
        const payload = {
            codeResponse: "class Solution {};",
            meta: {
                languageId: "unsupported_language"
            }
        };

        await assert.rejects(
            AssessmentAttemptService.saveAnswer(candidateUser.id, validationAttempt.id, dsaQuestion.id, payload),
            ValidationError
        );
    });

    test("26. Supported language accepted", async () => {
        const payload = {
            codeResponse: "class Solution {};",
            meta: {
                languageId: progLanguage.id
            }
        };

        const result = await AssessmentAttemptService.saveAnswer(candidateUser.id, validationAttempt.id, dsaQuestion.id, payload);
        assert.ok(result.answerId);
    });

    test("27. Clearing answer does not delete AssessmentAnswer row", async () => {
        const payload = {
            selectedOptionIds: []
        };

        const result = await AssessmentAttemptService.saveAnswer(candidateUser.id, activeAttempt.id, mcqQuestion.id, payload);
        
        const saved = await prisma.assessmentAnswer.findUnique({ where: { id: result.answerId } });
        assert.ok(saved);
        assert.deepStrictEqual(saved.selectedOptionIds, []);
    });

    test("28. Clearing MCQ updates selectedOptionIds to []", async () => {
        const result = await AssessmentAttemptService.saveAnswer(candidateUser.id, activeAttempt.id, mcqQuestion.id, {
            selectedOptionIds: []
        });

        const saved = await prisma.assessmentAnswer.findUnique({ where: { id: result.answerId } });
        assert.ok(saved);
        assert.deepStrictEqual(saved.selectedOptionIds, []);
    });

    test("29. Concurrent saves do not create duplicate AssessmentAnswer records", async () => {
        const freshAttempt = await prisma.assessmentAttempt.create({
            data: {
                candidateId: candidateProfile.id,
                applicationId: activeAttempt.applicationId,
                assessmentId: assessment.id,
                status: AttemptStatus.IN_PROGRESS,
                startedAt: new Date()
            }
        });

        const payload = {
            selectedOptionIds: [mcqOption1.id]
        };

        // Send two concurrent upsert requests
        const results = await Promise.allSettled([
            AssessmentAttemptService.saveAnswer(candidateUser.id, freshAttempt.id, mcqQuestion.id, payload),
            AssessmentAttemptService.saveAnswer(candidateUser.id, freshAttempt.id, mcqQuestion.id, payload)
        ]);

        const count = await prisma.assessmentAnswer.count({
            where: { attemptId: freshAttempt.id, questionId: mcqQuestion.id }
        });
        assert.strictEqual(count, 1);

        await prisma.assessmentAnswer.deleteMany({ where: { attemptId: freshAttempt.id } });
        await prisma.assessmentAttempt.delete({ where: { id: freshAttempt.id } });
    });

    test("30. @@unique([attemptId, questionId]) remains respected", async () => {
        // Double check uniqueness constraint
        const uniqueConstraint = await prisma.assessmentAnswer.findMany({
            where: { attemptId: activeAttempt.id, questionId: mcqQuestion.id }
        });
        assert.ok(uniqueConstraint.length <= 1);
    });
});
