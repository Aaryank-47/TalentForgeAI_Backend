import prisma from "../../../config/database.js";
import { JwtHelper } from "../../../common/helper/jwt.helper.js";
import { UserRole, InterviewType, InterviewStatus, InterviewMode, QuestionDifficulty, InterviewAssignmentCreationSource } from "@prisma/client";
import bcrypt from "bcrypt";
export async function seedInfosysTestData() {
    console.log("==================================================");
    console.log("SEEDING INFOSYS AI INTERVIEW TEST DATA");
    console.log("==================================================");
    // 1. Resolve Infosys Company
    let company = await prisma.company.findFirst({
        where: { companyName: { contains: "infosys", mode: "insensitive" } }
    });
    if (!company) {
        company = await prisma.company.create({
            data: {
                companyName: "Infosys",
                slug: "infosys-inc",
                status: "ACTIVE"
            }
        });
        console.log(`Created Infosys company: ${company.id}`);
    }
    else {
        console.log(`Found Infosys company: ${company.id}`);
    }
    // 2. Resolve Employer User & Company Member
    let employerMember = await prisma.companyMember.findFirst({
        where: { companyId: company.id },
        include: { user: true }
    });
    let employerUser;
    if (!employerMember) {
        const hashedPassword = await bcrypt.hash("Password@123", 10);
        employerUser = await prisma.user.create({
            data: {
                email: "recruiter@infosys.com",
                password: hashedPassword,
                role: UserRole.EMPLOYER,
                status: "ACTIVE"
            }
        });
        employerMember = await prisma.companyMember.create({
            data: {
                userId: employerUser.id,
                companyId: company.id,
                role: "OWNER",
                status: "ACTIVE"
            },
            include: { user: true }
        });
    }
    else {
        employerUser = employerMember.user;
    }
    const employerToken = JwtHelper.generateAccessToken({
        id: employerUser.id,
        email: employerUser.email,
        role: employerUser.role
    });
    // 3. Resolve Candidate User & Candidate Record
    let candidateUser = await prisma.user.findFirst({
        where: { email: "sunil@gmail.com" }
    });
    if (!candidateUser) {
        const hashedPassword = await bcrypt.hash("Password@123", 10);
        candidateUser = await prisma.user.create({
            data: {
                email: "sunil@gmail.com",
                password: hashedPassword,
                role: UserRole.CANDIDATE,
                status: "ACTIVE"
            }
        });
    }
    let candidate = await prisma.candidate.findUnique({
        where: { userId: candidateUser.id }
    });
    if (!candidate) {
        candidate = await prisma.candidate.create({
            data: {
                userId: candidateUser.id,
                fullName: "Sunil Pal (Infosys Applicant)"
            }
        });
    }
    const candidateToken = JwtHelper.generateAccessToken({
        id: candidateUser.id,
        email: candidateUser.email,
        role: candidateUser.role
    });
    // 4. Resolve Infosys Job
    let job = await prisma.job.findFirst({
        where: { companyId: company.id }
    });
    if (!job) {
        job = await prisma.job.create({
            data: {
                companyId: company.id,
                title: "Backend Software Engineer - Infosys",
                slug: "backend-software-engineer-infosys",
                description: "Design and implement scalable microservices using TypeScript, Node.js, and PostgreSQL.",
                employmentType: "FULL_TIME",
                workplaceType: "REMOTE",
                createdById: employerUser.id
            }
        });
    }
    // 5. Resolve Application
    let application = await prisma.application.findFirst({
        where: { candidateId: candidate.id, jobId: job.id }
    });
    if (!application) {
        let resume = await prisma.resume.findFirst({ where: { candidateId: candidate.id } });
        if (!resume) {
            resume = await prisma.resume.create({
                data: {
                    candidateId: candidate.id,
                    resumeName: "Sunil_Pal_Resume.pdf",
                    resumeUrl: "https://example.com/resumes/sunil_pal.pdf",
                    fileSize: 2048
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
    // 6. Resolve AI Interview Template
    let interview = await prisma.interview.findFirst({
        where: { companyId: company.id, title: "Infosys AI Technical Interview" },
        include: { aiConfiguration: true }
    });
    if (!interview) {
        interview = await prisma.interview.create({
            data: {
                companyId: company.id,
                title: "Infosys AI Technical Interview",
                description: "Automated AI interview assessing backend engineering, data structures, system design, and API security.",
                instructions: "Answer each question clearly. Code snippets and step-by-step logic are encouraged.",
                type: InterviewType.AI,
                mode: InterviewMode.INDIVIDUAL,
                status: InterviewStatus.ACTIVE,
                durationMinutes: 30,
                createdById: employerMember.id
            },
            include: { aiConfiguration: true }
        });
    }
    // Ensure Job-Interview Link
    const existingJobLink = await prisma.jobInterview.findFirst({
        where: { jobId: job.id, interviewId: interview.id }
    });
    if (!existingJobLink) {
        await prisma.jobInterview.create({
            data: {
                jobId: job.id,
                interviewId: interview.id,
                displayOrder: 1
            }
        });
    }
    // Upsert AI Configuration
    if (!interview.aiConfiguration) {
        await prisma.aIInterviewConfiguration.create({
            data: {
                interviewId: interview.id,
                questionCount: 5,
                difficulty: QuestionDifficulty.MEDIUM,
                allowFollowUps: true,
                systemPrompt: "You are an elite technical recruiter conducting a backend engineering interview for Infosys.",
                evaluationMetrics: {
                    technicalDepth: "Understanding of Node.js event loop, async patterns, SQL performance",
                    problemSolving: "Algorithmic clarity and edge case handling",
                    communication: "Conciseness and technical accuracy"
                }
            }
        });
    }
    else {
        await prisma.aIInterviewConfiguration.update({
            where: { interviewId: interview.id },
            data: {
                questionCount: 5,
                allowFollowUps: true,
                difficulty: QuestionDifficulty.MEDIUM
            }
        });
    }
    // 7. Resolve Candidate Assignment
    let assignment = await prisma.interviewAssignment.findFirst({
        where: { interviewId: interview.id, applicationId: application.id }
    });
    if (!assignment) {
        assignment = await prisma.interviewAssignment.create({
            data: {
                interviewId: interview.id,
                applicationId: application.id,
                creationSource: InterviewAssignmentCreationSource.MANUAL
            }
        });
    }
    // 8. Create Fresh Test Sessions
    const normalSession = await prisma.interviewSession.create({
        data: {
            interviewId: interview.id,
            status: "SCHEDULED",
            scheduledAt: new Date(),
            participants: {
                create: {
                    assignmentId: assignment.id,
                    participantType: "CANDIDATE"
                }
            }
        }
    });
    const timeoutSession = await prisma.interviewSession.create({
        data: {
            interviewId: interview.id,
            status: "SCHEDULED",
            scheduledAt: new Date(),
            participants: {
                create: {
                    assignmentId: assignment.id,
                    participantType: "CANDIDATE"
                }
            }
        }
    });
    console.log("--------------------------------------------------");
    console.log(`Company ID (companyId): ${company.id}`);
    console.log(`Employer User Email: ${employerUser.email}`);
    console.log(`Employer Token (JWT):\n${employerToken}\n`);
    console.log(`Candidate Name: ${candidate.fullName}`);
    console.log(`Candidate Email: ${candidateUser.email}`);
    console.log(`Candidate User ID: ${candidateUser.id}`);
    console.log(`Candidate Token (JWT):\n${candidateToken}\n`);
    console.log(`Interview ID: ${interview.id}`);
    console.log(`Normal Session ID (sessionId): ${normalSession.id}`);
    console.log(`Timeout Session ID (sessionId): ${timeoutSession.id}`);
    console.log("==================================================\n");
    return {
        companyId: company.id,
        employerToken,
        candidateToken,
        candidateUserId: candidateUser.id,
        interviewId: interview.id,
        normalSessionId: normalSession.id,
        timeoutSessionId: timeoutSession.id
    };
}
if (process.argv[1]?.includes("seedInfosysAIInterviewData")) {
    seedInfosysTestData()
        .then(() => prisma.$disconnect())
        .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
}
//# sourceMappingURL=seedInfosysAIInterviewData.js.map