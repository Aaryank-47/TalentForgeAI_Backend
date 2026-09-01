/**
 * Seed helper for the AI Interview Automated Test Suite.
 *
 * Creates a self-contained set of database records that mimic an Infosys
 * AI-interview scenario:
 *   Company -> Recruiter (CompanyMember) -> Candidate (User + Candidate) ->
 *   Job -> Application -> Interview (AI) -> AIInterviewConfiguration ->
 *   InterviewAssignment -> InterviewSession (SCHEDULED, with CANDIDATE participant)
 *
 * Returns the minimal surface area that the test suite needs:
 *   - `normalSessionId`  - the SCHEDULED session the unit/socket tests drive
 *   - candidateUserId  - User.id of the candidate (for service-level auth)
 *   - candidateToken   - signed JWT access token for Socket.IO auth headers
 *   - interviewId      - the Interview.id (for finding assignments in socket tests)
 *
 * The caller is responsible for teardown; no cleanup is performed here.
 */

import prisma from "../../../config/database.js";
import { JwtHelper } from "../../../common/helper/jwt.helper.js";
import { UserRole, InterviewType, InterviewMode, InterviewSessionStatus } from "@prisma/client";

export async function seedInfosysTestData() {
    const timestamp = Date.now();

    // 1. Company
    const company = await prisma.company.create({
        data: {
            companyName: `Infosys AI Interview ${timestamp}`,
            slug: `infosys-ai-interview-${timestamp}`,
            status: "ACTIVE"
        }
    });

    // 2. Recruiter user + company member
    const recruiterUser = await prisma.user.create({
        data: {
            email: `recruiter_ai_${timestamp}@infosys-test.com`,
            password: "Password@123",
            role: UserRole.EMPLOYER,
            status: "ACTIVE"
        }
    });

    const recruiterMember = await prisma.companyMember.create({
        data: {
            userId: recruiterUser.id,
            companyId: company.id,
            role: "RECRUITER",
            status: "ACTIVE"
        }
    });

    // 3. Candidate user + Candidate profile
    const candidateUser = await prisma.user.create({
        data: {
            email: `candidate_ai_${timestamp}@infosys-test.com`,
            password: "Password@123",
            role: UserRole.CANDIDATE,
            status: "ACTIVE"
        }
    });

    const candidate = await prisma.candidate.create({
        data: {
            userId: candidateUser.id,
            fullName: "Arjun Sharma"
        }
    });

    // 4. Job listing
    const job = await prisma.job.create({
        data: {
            companyId: company.id,
            title: `Senior Backend Engineer Node.js ${timestamp}`,
            slug: `senior-backend-engineer-nodejs-${timestamp}`,
            description: "Node.js and PostgreSQL backend role at Infosys",
            employmentType: "FULL_TIME",
            workplaceType: "REMOTE",
            createdById: recruiterUser.id
        }
    });

    // 5. Candidate application
    const application = await prisma.application.create({
        data: {
            candidateId: candidate.id,
            jobId: job.id,
            status: "APPLIED"
        }
    });

    // 6. AI Interview + configuration
    const interview = await prisma.interview.create({
        data: {
            companyId: company.id,
            createdById: recruiterMember.id,
            title: "Infosys AI Technical Interview",
            type: InterviewType.AI,
            mode: InterviewMode.INDIVIDUAL,
            durationMinutes: 30,
            status: "ACTIVE",
            aiConfiguration: {
                create: {
                    questionCount: 5,
                    difficulty: "MEDIUM",
                    allowFollowUps: true,
                    systemPrompt:
                        "You are a senior technical interviewer at Infosys assessing Node.js and PostgreSQL skills."
                }
            }
        }
    });

    // 7. Interview assignment
    const assignment = await prisma.interviewAssignment.create({
        data: {
            interviewId: interview.id,
            applicationId: application.id,
            creationSource: "MANUAL",
            assignedById: recruiterMember.id
        }
    });

    // 8. Interview session (SCHEDULED) with CANDIDATE participant
    const session = await prisma.interviewSession.create({
        data: {
            interviewId: interview.id,
            scheduledAt: new Date(Date.now() + 3600000),
            status: InterviewSessionStatus.SCHEDULED,
            participants: {
                create: {
                    assignmentId: assignment.id,
                    participantType: "CANDIDATE"
                }
            }
        }
    });

    // 9. JWT access token for socket auth
    const candidateToken = JwtHelper.generateAccessToken({
        id: candidateUser.id,
        email: candidateUser.email,
        role: candidateUser.role
    });

    return {
        /** The primary SCHEDULED session used by unit and socket tests */
        normalSessionId: session.id,
        /** User.id of the candidate principal */
        candidateUserId: candidateUser.id,
        /** Signed JWT for Socket.IO auth: { auth: { token: candidateToken } } */
        candidateToken,
        /** Interview.id - used by socket tests to resolve assignment records */
        interviewId: interview.id
    };
}
