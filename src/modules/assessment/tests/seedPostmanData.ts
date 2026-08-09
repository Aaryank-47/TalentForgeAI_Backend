import prisma from "../../../config/database.js";
import { JwtHelper } from "../../../common/helper/jwt.helper.js";
import { AttemptStatus, QuestionType, UserRole, EvaluationStatus } from "@prisma/client";
import bcrypt from "bcrypt";

async function main() {
    console.log("Checking database for Postman evaluation & ATS test data...");

    const hashedPassword = await bcrypt.hash("Password@123", 10);

    // 1. Candidate User
    let candidateUser = await prisma.user.findFirst({
        where: { email: "aaryankamalwanshi274@gmail.com" }
    });
    if (!candidateUser) {
        candidateUser = await prisma.user.create({
            data: {
                email: "aaryankamalwanshi274@gmail.com",
                password: hashedPassword,
                role: UserRole.CANDIDATE,
                status: "ACTIVE"
            }
        });
        console.log("Created candidate user.");
    }

    let candidate = await prisma.candidate.findUnique({
        where: { userId: candidateUser.id }
    });
    if (!candidate) {
        candidate = await prisma.candidate.create({
            data: {
                userId: candidateUser.id,
                fullName: "Postman Candidate"
            }
        });
    }

    // 2. Employer User
    let employerUser = await prisma.user.findFirst({
        where: { email: "employer-evaluator@example.com" }
    });
    if (!employerUser) {
        employerUser = await prisma.user.create({
            data: {
                email: "employer-evaluator@example.com",
                password: hashedPassword,
                role: UserRole.EMPLOYER,
                status: "ACTIVE"
            }
        });
        console.log("Created employer user.");
    }

    // Ensure Employer Profile exists
    let employerProfile = await prisma.employer.findUnique({
        where: { userId: employerUser.id }
    });
    if (!employerProfile) {
        employerProfile = await prisma.employer.create({
            data: {
                userId: employerUser.id,
                fullName: "Postman Employer Recruiter"
            }
        });
        console.log("Created Employer profile.");
    }

    // 3. Resolve Company & Member
    let company = await prisma.company.findFirst();
    if (!company) {
        company = await prisma.company.create({
            data: {
                companyName: "TalentForge Corp",
                slug: "talentforge-corp",
                status: "ACTIVE"
            }
        });
    }

    let companyMember = await prisma.companyMember.findFirst({
        where: { userId: employerUser.id, companyId: company.id }
    });
    if (!companyMember) {
        companyMember = await prisma.companyMember.create({
            data: {
                userId: employerUser.id,
                companyId: company.id,
                role: "OWNER",
                status: "ACTIVE"
            }
        });
    }

    // Generate JWTs
    const candidateToken = JwtHelper.generateAccessToken({
        id: candidateUser.id,
        email: candidateUser.email,
        role: candidateUser.role
    });

    const employerToken = JwtHelper.generateAccessToken({
        id: employerUser.id,
        email: employerUser.email,
        role: employerUser.role
    });

    // 4. Resolve custom Hiring Workflow Stages
    let workflow = await prisma.workflow.findFirst({
        where: { companyId: company.id }
    });
    if (!workflow) {
        workflow = await prisma.workflow.create({
            data: {
                name: "Postman Integration Workflow",
                companyId: company.id,
                status: "ACTIVE"
            }
        });
    }

    let stageLib1 = await prisma.stageLibrary.findFirst({
        where: { name: "Technical Assessment Stage", companyId: company.id }
    });
    if (!stageLib1) {
        stageLib1 = await prisma.stageLibrary.create({
            data: {
                name: "Technical Assessment Stage",
                type: "CUSTOM",
                companyId: company.id
            }
        });
    }

    let stageLib2 = await prisma.stageLibrary.findFirst({
        where: { name: "Technical Interview Stage", companyId: company.id }
    });
    if (!stageLib2) {
        stageLib2 = await prisma.stageLibrary.create({
            data: {
                name: "Technical Interview Stage",
                type: "CUSTOM",
                companyId: company.id
            }
        });
    }

    let stage1 = await prisma.workflowStage.findFirst({
        where: { workflowId: workflow.id, stageLibraryId: stageLib1.id }
    });
    if (!stage1) {
        stage1 = await prisma.workflowStage.create({
            data: {
                workflowId: workflow.id,
                stageLibraryId: stageLib1.id,
                order: 1
            }
        });
    }

    let stage2 = await prisma.workflowStage.findFirst({
        where: { workflowId: workflow.id, stageLibraryId: stageLib2.id }
    });
    if (!stage2) {
        stage2 = await prisma.workflowStage.create({
            data: {
                workflowId: workflow.id,
                stageLibraryId: stageLib2.id,
                order: 2
            }
        });
    }

    // 5. Job & Application
    let job = await prisma.job.findFirst({
        where: { companyId: company.id }
    });
    if (!job) {
        job = await prisma.job.create({
            data: {
                companyId: company.id,
                title: "Full Stack Engineer",
                slug: "full-stack-engineer-real",
                description: "Postman evaluation description",
                employmentType: "FULL_TIME",
                workplaceType: "REMOTE",
                createdById: employerUser.id,
                workflowId: workflow.id
            }
        });
    } else {
        job = await prisma.job.update({
            where: { id: job.id },
            data: { workflowId: workflow.id }
        });
    }

    let application = await prisma.application.findFirst({
        where: { candidateId: candidate.id }
    });
    if (!application) {
        let resume = await prisma.resume.create({
            data: {
                candidateId: candidate.id,
                resumeName: "My Resume",
                resumeUrl: "http://example.com/resume.pdf",
                fileSize: 1024
            }
        });
        application = await prisma.application.create({
            data: {
                candidateId: candidate.id,
                jobId: job.id,
                resumeId: resume.id,
                status: "APPLIED"
            }
        });
    }

    // Map Application to ApplicationWorkflow at stage 1
    let appWorkflow = await prisma.applicationWorkflow.findUnique({
        where: { applicationId: application.id }
    });
    if (!appWorkflow) {
        appWorkflow = await prisma.applicationWorkflow.create({
            data: {
                applicationId: application.id,
                workflowStageId: stage1.id
            }
        });
    } else {
        appWorkflow = await prisma.applicationWorkflow.update({
            where: { id: appWorkflow.id },
            data: { workflowStageId: stage1.id } // Reset back to first stage for transitions
        });
    }

    // 6. Assessment
    let assessment = await prisma.assessment.findFirst({
        where: { companyId: company.id, status: "PUBLISHED" }
    });
    if (!assessment) {
        assessment = await prisma.assessment.create({
            data: {
                companyId: company.id,
                title: "Postman Assessment Evaluation Suite",
                durationMinutes: 60,
                status: "PUBLISHED",
                passingScore: 50.0,
                createdById: companyMember.id
            }
        });
    }

    let section = await prisma.assessmentSection.findFirst({
        where: { assessmentId: assessment.id }
    });
    if (!section) {
        section = await prisma.assessmentSection.create({
            data: {
                assessmentId: assessment.id,
                title: "Section 1",
                displayOrder: 1,
                sectionType: QuestionType.MCQ
            }
        });
    }

    // MCQ Question
    let mcqQuestion = await prisma.question.findFirst({
        where: { type: QuestionType.MCQ, companyId: company.id },
        include: {
            mcqDetail: {
                include: {
                    options: true
                }
            }
        }
    });
    if (!mcqQuestion) {
        mcqQuestion = await prisma.question.create({
            data: {
                title: "MCQ evaluation question",
                description: "Choose option",
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
                                    { optionText: "True", displayOrder: 1, isCorrect: true },
                                    { optionText: "False", displayOrder: 2, isCorrect: false }
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
            data: { sectionId: section.id, questionId: mcqQuestion.id, displayOrder: 1 }
        });
    }

    // DSA Question
    let dsaQuestion = await prisma.question.findFirst({
        where: { type: QuestionType.DSA, companyId: company.id },
        include: {
            dsaDetail: {
                include: {
                    supportedLanguages: true
                }
            }
        }
    });
    if (!dsaQuestion) {
        let lang = await prisma.programmingLanguage.findFirst();
        if (!lang) {
            lang = await prisma.programmingLanguage.create({
                data: { name: "Python", slug: "python", isActive: true }
            });
        }
        dsaQuestion = await prisma.question.create({
            data: {
                title: "DSA evaluation question",
                description: "Reverse string",
                type: QuestionType.DSA,
                difficulty: "MEDIUM",
                estimatedTime: 30,
                defaultMarks: 50.0,
                ownership: "COMPANY",
                companyId: company.id,
                dsaDetail: {
                    create: {
                        starterCode: "def reverse(): pass",
                        referenceSolution: "def reverse(): pass",
                        memoryLimit: 256,
                        timeLimit: 1000,
                        supportedLanguages: {
                            create: {
                                programmingLanguageId: lang.id
                            }
                        }
                    }
                }
            },
            include: {
                dsaDetail: {
                    include: {
                        supportedLanguages: true
                    }
                }
            }
        });
        await prisma.assessmentSectionItem.create({
            data: { sectionId: section.id, questionId: dsaQuestion.id, displayOrder: 2 }
        });
    }

    const languageId = dsaQuestion.dsaDetail?.supportedLanguages[0]?.programmingLanguageId || "";

    // 7. Reset / Resolve Attempts
    // IN_PROGRESS Attempt
    let inProgressAttempt = await prisma.assessmentAttempt.findFirst({
        where: { candidateId: candidate.id, assessmentId: assessment.id, status: AttemptStatus.IN_PROGRESS }
    });
    if (!inProgressAttempt) {
        inProgressAttempt = await prisma.assessmentAttempt.create({
            data: {
                candidateId: candidate.id,
                applicationId: application.id,
                assessmentId: assessment.id,
                status: AttemptStatus.IN_PROGRESS,
                startedAt: new Date(),
                evaluationStatus: EvaluationStatus.PENDING
            }
        });
    } else {
        await prisma.assessmentAttempt.update({
            where: { id: inProgressAttempt.id },
            data: { startedAt: new Date(), evaluationStatus: EvaluationStatus.PENDING }
        });
    }

    // SUBMITTED Attempt
    let submittedAttempt = await prisma.assessmentAttempt.findFirst({
        where: { candidateId: candidate.id, assessmentId: assessment.id, status: AttemptStatus.SUBMITTED, evaluationStatus: EvaluationStatus.PENDING }
    });
    if (!submittedAttempt) {
        submittedAttempt = await prisma.assessmentAttempt.create({
            data: {
                candidateId: candidate.id,
                applicationId: application.id,
                assessmentId: assessment.id,
                status: AttemptStatus.SUBMITTED,
                startedAt: new Date(),
                evaluationStatus: EvaluationStatus.PENDING
            }
        });
    }

    let mcqAnswer = await prisma.assessmentAnswer.findUnique({
        where: { attemptId_questionId: { attemptId: submittedAttempt.id, questionId: mcqQuestion.id } }
    });
    if (!mcqAnswer) {
        await prisma.assessmentAnswer.create({
            data: {
                attemptId: submittedAttempt.id,
                questionId: mcqQuestion.id,
                startedAt: new Date(),
                selectedOptionIds: [mcqQuestion.mcqDetail?.options[0]?.id || ""]
            }
        });
    }

    // COMPLETED Attempt
    let completedAttempt = await prisma.assessmentAttempt.findFirst({
        where: { candidateId: candidate.id, assessmentId: assessment.id, status: AttemptStatus.SUBMITTED, evaluationStatus: EvaluationStatus.COMPLETED }
    });
    if (!completedAttempt) {
        completedAttempt = await prisma.assessmentAttempt.create({
            data: {
                candidateId: candidate.id,
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
    }

    console.log("\n==================================================");
    console.log("POSTMAN EVALUATION TEST SUITE READY");
    console.log("==================================================");
    console.log(`Candidate JWT:\n${candidateToken}\n`);
    console.log(`Employer JWT:\n${employerToken}\n`);
    console.log(`Application ID: ${application.id}`);
    console.log(`IN_PROGRESS Attempt ID: ${inProgressAttempt.id}`);
    console.log(`SUBMITTED Attempt ID: ${submittedAttempt.id}`);
    console.log(`COMPLETED Attempt ID: ${completedAttempt.id}`);
    console.log(`MCQ Question ID: ${mcqQuestion.id}`);
    console.log(`DSA Question ID: ${dsaQuestion.id}`);
    console.log(`DSA Programming Language ID: ${languageId}`);
    console.log("==================================================\n");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
