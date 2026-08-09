import prisma from "../../../config/database.js";
import { JwtHelper } from "../../../common/helper/jwt.helper.js";
import { AttemptStatus, QuestionType, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";

async function main() {
    console.log("Checking database for Postman test data...");

    const hashedPassword = await bcrypt.hash("Password@123", 10);

    // 1. Resolve / Create Candidate User
    let user = await prisma.user.findFirst({
        where: { role: UserRole.CANDIDATE }
    });
    if (!user) {
        user = await prisma.user.create({
            data: {
                email: "postman-test-candidate@example.com",
                password: hashedPassword,
                role: UserRole.CANDIDATE,
                status: "ACTIVE"
            }
        });
        console.log("Created test candidate user.");
    } else {
        user = await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });
        console.log("Updated test candidate password.");
    }

    let candidate = await prisma.candidate.findUnique({
        where: { userId: user.id }
    });
    if (!candidate) {
        candidate = await prisma.candidate.create({
            data: {
                userId: user.id,
                fullName: "Postman Test Candidate"
            }
        });
        console.log("Created test candidate profile.");
    }

    // 2. Generate Candidate JWT Access Token
    const accessToken = JwtHelper.generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role
    });

    // 3. Resolve / Create Job & Application
    let job = await prisma.job.findFirst();
    if (!job) {
        let company = await prisma.company.findFirst();
        if (!company) {
            company = await prisma.company.create({
                data: {
                    companyName: "Postman Test Company",
                    slug: "postman-test-company",
                    status: "ACTIVE"
                }
            });
        }
        job = await prisma.job.create({
            data: {
                companyId: company.id,
                title: "Software Engineer",
                slug: "se-postman-test",
                description: "Job description for postman testing",
                employmentType: "FULL_TIME",
                workplaceType: "REMOTE",
                createdById: user.id
            }
        });
        console.log("Created test job.");
    }

    let application = await prisma.application.findFirst({
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
        console.log("Created test application.");
    }

    // 4. Resolve / Create Assessment & Section & Question
    let assessment = await prisma.assessment.findFirst({
        where: { status: "PUBLISHED" }
    });
    if (!assessment) {
        let company = await prisma.company.findFirst();
        if (!company) {
            company = await prisma.company.create({
                data: {
                    companyName: "Postman Test Company",
                    slug: "postman-test-company",
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
                    userId: user.id,
                    companyId: company.id,
                    role: "OWNER"
                }
            });
        }
        assessment = await prisma.assessment.create({
            data: {
                companyId: company.id,
                title: "Postman Dev Assessment",
                durationMinutes: 60,
                status: "PUBLISHED",
                createdById: companyMember.id
            }
        });
        console.log("Created test assessment.");
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
                sectionType: "MCQ"
            }
        });
    }

    let mcqQuestion = await prisma.question.findFirst({
        where: { type: QuestionType.MCQ }
    });
    if (!mcqQuestion) {
        mcqQuestion = await prisma.question.create({
            data: {
                title: "Sample MCQ",
                description: "Is this a test?",
                type: QuestionType.MCQ,
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
                                    { optionText: "Yes", displayOrder: 1, isCorrect: true },
                                    { optionText: "No", displayOrder: 2, isCorrect: false }
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
        console.log("Created test question.");
    }

    const sectionItem = await prisma.assessmentSectionItem.findFirst({
        where: { sectionId: section.id, questionId: mcqQuestion.id }
    });
    if (!sectionItem) {
        const lastItem = await prisma.assessmentSectionItem.findFirst({
            where: { sectionId: section.id },
            orderBy: { displayOrder: "desc" }
        });
        const order = lastItem ? lastItem.displayOrder + 1 : 1;
        await prisma.assessmentSectionItem.create({
            data: {
                sectionId: section.id,
                questionId: mcqQuestion.id,
                displayOrder: order
            }
        });
    }

    // 5. Resolve / Create Assessment Attempt
    let attempt = await prisma.assessmentAttempt.findFirst({
        where: {
            candidateId: candidate.id,
            assessmentId: assessment.id,
            status: AttemptStatus.IN_PROGRESS
        }
    });
    if (!attempt || new Date(attempt.startedAt || attempt.createdAt).getTime() + (assessment.durationMinutes || 60) * 60 * 1000 < Date.now()) {
        if (attempt) {
            // update existing attempt to refresh timer
            attempt = await prisma.assessmentAttempt.update({
                where: { id: attempt.id },
                data: { startedAt: new Date(), status: AttemptStatus.IN_PROGRESS }
            });
        } else {
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
        console.log("Created/Refreshed assessment attempt.");
    }

    // 6. Resolve / Create pre-saved Answer to GET
    let answer = await prisma.assessmentAnswer.findUnique({
        where: {
            attemptId_questionId: {
                attemptId: attempt.id,
                questionId: mcqQuestion.id
            }
        }
    });
    if (!answer) {
        answer = await prisma.assessmentAnswer.create({
            data: {
                attemptId: attempt.id,
                questionId: mcqQuestion.id,
                startedAt: new Date(),
                selectedOptionIds: []
            }
        });
        console.log("Created test answer.");
    }

    console.log("\n==================================================");
    console.log("POSTMAN TEST DATA SUITE READY");
    console.log("==================================================");
    console.log(`Bearer Token (JWT):\n${accessToken}\n`);
    console.log(`Attempt ID: ${attempt.id}`);
    console.log(`Question ID: ${mcqQuestion.id}`);
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
