import { describe, test, expect, beforeAll, afterAll, jest } from "@jest/globals";
import prisma, { closeDatabase } from "../../../config/database.js";
import { InterviewsServices, JobInterviewsServices } from "../services/interviews.service.js";
import { UserRole, CompanyStatus, InterviewType, InterviewMode } from "@prisma/client";
describe("Interviews API Service tests", () => {
    jest.setTimeout(90000); // Complex suite with heavy beforeAll and nested test operations (~54.5s locally, longer in CI)
    let employerUser;
    let company;
    let companyMember;
    beforeAll(async () => {
        const testId = `test_int_${Date.now()}`;
        // Create Employer User
        employerUser = await prisma.user.create({
            data: {
                email: `employer_${testId}@example.com`,
                password: "hashedpassword",
                role: UserRole.EMPLOYER,
                status: "ACTIVE"
            }
        });
        // Create Company
        company = await prisma.company.create({
            data: {
                companyName: `Test Company ${testId}`,
                slug: `test-company-${testId}`,
                status: CompanyStatus.ACTIVE,
                isVerified: true
            }
        });
        // Add user to company as active member
        companyMember = await prisma.companyMember.create({
            data: {
                userId: employerUser.id,
                companyId: company.id,
                role: "ADMIN",
                status: "ACTIVE"
            }
        });
    });
    test("should successfully create a NORMAL interview", async () => {
        const interviewData = {
            title: "Backend Technical Interview",
            description: "Technical interview for backend candidates",
            instructions: "Evaluate Node.js, PostgreSQL and system design.",
            type: InterviewType.NORMAL,
            mode: InterviewMode.INDIVIDUAL,
            durationMinutes: 45
        };
        const result = await InterviewsServices.createInterview(company.id, companyMember.id, interviewData);
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.companyId).toBe(company.id);
        expect(result.title).toBe(interviewData.title);
        expect(result.type).toBe(InterviewType.NORMAL);
        expect(result.mode).toBe(InterviewMode.INDIVIDUAL);
        expect(result.durationMinutes).toBe(45);
        expect(result.status).toBe("DRAFT");
        expect(result.createdBy.id).toBe(companyMember.id);
    });
    test("should successfully create an AI interview with AI configuration", async () => {
        const aiInterviewData = {
            title: "AI Backend Interview",
            description: "AI-powered backend interview",
            instructions: "Evaluate backend engineering skills.",
            type: InterviewType.AI,
            mode: InterviewMode.INDIVIDUAL,
            durationMinutes: 30,
            aiConfiguration: {
                systemPrompt: "You are a senior backend interviewer.",
                evaluationMetrics: {
                    technicalKnowledge: 30,
                    problemSolving: 30,
                    communication: 20,
                    depth: 20
                }
            }
        };
        const result = await InterviewsServices.createInterview(company.id, companyMember.id, aiInterviewData);
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.title).toBe(aiInterviewData.title);
        expect(result.type).toBe(InterviewType.AI);
        // Verify that AI configuration is created
        const aiConfig = await prisma.aIInterviewConfiguration.findUnique({
            where: { interviewId: result.id }
        });
        expect(aiConfig).toBeDefined();
        expect(aiConfig?.systemPrompt).toBe(aiInterviewData.aiConfiguration.systemPrompt);
    });
    test("should retrieve paginated list of interviews", async () => {
        const query = {
            page: "1",
            limit: "10",
            sortBy: "createdAt",
            sortOrder: "desc"
        };
        const result = await InterviewsServices.getCompanyInterviews(company.id, query);
        expect(result).toBeDefined();
        expect(Array.isArray(result.items)).toBe(true);
        expect(result.pagination).toBeDefined();
        expect(result.pagination.totalItems).toBeGreaterThanOrEqual(1);
    });
    test("should retrieve a single interview by ID", async () => {
        // Create an interview first
        const newInt = await InterviewsServices.createInterview(company.id, companyMember.id, {
            title: "Test GET BY ID",
            type: InterviewType.NORMAL,
            mode: InterviewMode.INDIVIDUAL
        });
        const result = await InterviewsServices.getInterviewById(company.id, newInt.id);
        expect(result).toBeDefined();
        expect(result.id).toBe(newInt.id);
        expect(result.title).toBe("Test GET BY ID");
        expect(Array.isArray(result.jobs)).toBe(true);
    });
    test("should update an interview", async () => {
        // Create an interview
        const newInt = await InterviewsServices.createInterview(company.id, companyMember.id, {
            title: "Test UPDATE",
            type: InterviewType.NORMAL,
            mode: InterviewMode.INDIVIDUAL
        });
        const updateData = {
            title: "Test UPDATE - Modified",
            durationMinutes: 90
        };
        const result = await InterviewsServices.updateInterview(company.id, newInt.id, updateData);
        expect(result).toBeDefined();
        expect(result.id).toBe(newInt.id);
        expect(result.title).toBe(updateData.title);
        expect(result.durationMinutes).toBe(updateData.durationMinutes);
    });
    test("should change interview status to ARCHIVED", async () => {
        // Create an interview
        const newInt = await InterviewsServices.createInterview(company.id, companyMember.id, {
            title: "Test ARCHIVE",
            type: InterviewType.NORMAL,
            mode: InterviewMode.INDIVIDUAL
        });
        const result = await InterviewsServices.changeInterviewStatus(company.id, newInt.id, "ARCHIVED");
        expect(result).toBeDefined();
        expect(result.id).toBe(newInt.id);
        expect(result.status).toBe("ARCHIVED");
    });
});
describe("JobInterviewsServices tests", () => {
    let employerUser;
    let company;
    let companyMember;
    let job;
    let interview1;
    let interview2;
    beforeAll(async () => {
        const testId = `test_job_int_${Date.now()}`;
        employerUser = await prisma.user.create({
            data: {
                email: `employer_${testId}@example.com`,
                password: "hashedpassword",
                role: UserRole.EMPLOYER,
                status: "ACTIVE"
            }
        });
        company = await prisma.company.create({
            data: {
                companyName: `Test Company ${testId}`,
                slug: `test-company-${testId}`,
                status: CompanyStatus.ACTIVE,
                isVerified: true
            }
        });
        companyMember = await prisma.companyMember.create({
            data: {
                userId: employerUser.id,
                companyId: company.id,
                role: "ADMIN",
                status: "ACTIVE"
            }
        });
        job = await prisma.job.create({
            data: {
                companyId: company.id,
                title: "Backend Engineer",
                slug: `backend-engineer-${testId}`,
                description: "Test job description",
                employmentType: "FULL_TIME",
                workplaceType: "REMOTE",
                createdById: companyMember.id
            }
        });
        interview1 = await InterviewsServices.createInterview(company.id, companyMember.id, {
            title: "Technical Interview",
            type: InterviewType.NORMAL,
            mode: InterviewMode.INDIVIDUAL
        });
        await prisma.interview.update({
            where: { id: interview1.id },
            data: { status: 'ACTIVE' }
        });
        interview2 = await InterviewsServices.createInterview(company.id, companyMember.id, {
            title: "HR Interview",
            type: InterviewType.NORMAL,
            mode: InterviewMode.INDIVIDUAL
        });
        await prisma.interview.update({
            where: { id: interview2.id },
            data: { status: 'ACTIVE' }
        });
    });
    test("should attach an interview to a job", async () => {
        const result = await JobInterviewsServices.attachInterviewToJob(company.id, job.id, {
            interviewId: interview1.id,
            displayOrder: 1,
            isMandatory: true
        });
        expect(result).toBeDefined();
        expect(result.jobId).toBe(job.id);
        expect(result.interviewId).toBe(interview1.id);
        expect(result.displayOrder).toBe(1);
    });
    test("should prevent attaching the same interview twice", async () => {
        await expect(JobInterviewsServices.attachInterviewToJob(company.id, job.id, {
            interviewId: interview1.id,
            displayOrder: 2
        })).rejects.toThrow("Interview is already attached to this job");
    });
    test("should attach a second interview with default displayOrder", async () => {
        const result = await JobInterviewsServices.attachInterviewToJob(company.id, job.id, {
            interviewId: interview2.id
        });
        expect(result).toBeDefined();
        expect(result.displayOrder).toBe(2);
    });
    test("should get all job interviews ordered by displayOrder", async () => {
        const results = await JobInterviewsServices.getJobInterviews(company.id, job.id);
        expect(results.length).toBe(2);
        expect(results[0]?.interviewId).toBe(interview1.id);
        expect(results[1]?.interviewId).toBe(interview2.id);
        expect(results[0]?.interview.title).toBe("Technical Interview");
    });
    test("should reorder job interviews", async () => {
        const results = await JobInterviewsServices.reorderJobInterviews(company.id, job.id, {
            interviews: [
                { interviewId: interview1.id, displayOrder: 2 },
                { interviewId: interview2.id, displayOrder: 1 }
            ]
        });
        expect(results.length).toBe(2);
        expect(results[0]?.interviewId).toBe(interview2.id); // Since it has displayOrder 1 now
        expect(results[0]?.displayOrder).toBe(1);
        expect(results[1]?.interviewId).toBe(interview1.id);
        expect(results[1]?.displayOrder).toBe(2);
    });
    test("should remove an interview from a job", async () => {
        const result = await JobInterviewsServices.removeInterviewFromJob(company.id, job.id, interview1.id);
        expect(result).toBeDefined();
        expect(result.interviewId).toBe(interview1.id);
        const currentInterviews = await JobInterviewsServices.getJobInterviews(company.id, job.id);
        expect(currentInterviews.length).toBe(1);
        expect(currentInterviews[0]?.interviewId).toBe(interview2.id);
    });
});
describe("InterviewSessionsServices & ParticipantsServices tests", () => {
    let employerUser;
    let company;
    let companyMember;
    let candidateUser;
    let candidate;
    let job;
    let resume;
    let application;
    let interview;
    let assignment;
    let session;
    beforeAll(async () => {
        const testId = `test_sess_${Date.now()}`;
        // Create Employer User
        employerUser = await prisma.user.create({
            data: {
                email: `employer_${testId}@example.com`,
                password: "hashedpassword",
                role: UserRole.EMPLOYER,
                status: "ACTIVE"
            }
        });
        // Create Company
        company = await prisma.company.create({
            data: {
                companyName: `Test Company ${testId}`,
                slug: `test-company-${testId}`,
                status: CompanyStatus.ACTIVE,
                isVerified: true
            }
        });
        // Add user to company as active member
        companyMember = await prisma.companyMember.create({
            data: {
                userId: employerUser.id,
                companyId: company.id,
                role: "ADMIN",
                status: "ACTIVE"
            }
        });
        // Create Candidate User
        candidateUser = await prisma.user.create({
            data: {
                email: `candidate_${testId}@example.com`,
                password: "hashedpassword",
                role: UserRole.CANDIDATE,
                status: "ACTIVE"
            }
        });
        candidate = await prisma.candidate.create({
            data: {
                userId: candidateUser.id,
                fullName: "Test Candidate",
            }
        });
        job = await prisma.job.create({
            data: {
                companyId: company.id,
                title: "Backend Engineer",
                slug: `backend-engineer-${testId}`,
                description: "Test job description",
                employmentType: "FULL_TIME",
                workplaceType: "REMOTE",
                createdById: companyMember.id,
                status: "PUBLISHED"
            }
        });
        resume = await prisma.resume.create({
            data: {
                candidateId: candidate.id,
                resumeName: "resume.pdf",
                resumeUrl: "https://example.com/resume.pdf",
                fileSize: 1024
            }
        });
        application = await prisma.application.create({
            data: {
                candidateId: candidate.id,
                jobId: job.id
            }
        });
        interview = await prisma.interview.create({
            data: {
                title: "Tech Interview",
                type: InterviewType.NORMAL,
                mode: InterviewMode.INDIVIDUAL,
                durationMinutes: 60,
                companyId: company.id,
                createdById: companyMember.id,
                status: "ACTIVE"
            }
        });
        // Attach interview to job
        await prisma.jobInterview.create({
            data: {
                jobId: job.id,
                interviewId: interview.id,
                displayOrder: 1,
                isMandatory: true
            }
        });
        assignment = await prisma.interviewAssignment.create({
            data: {
                interviewId: interview.id,
                applicationId: application.id,
                creationSource: "MANUAL",
                assignedById: companyMember.id
            }
        });
    });
    test("should create an interview session with participants", async () => {
        const scheduledAt = new Date(Date.now() + 86400000).toISOString(); // Tomorrow
        const { InterviewSessionsServices } = await import("../services/interviews.service.js");
        session = await InterviewSessionsServices.createSession(company.id, companyMember.id, interview.id, {
            scheduledAt,
            assignmentIds: [assignment.id],
            companyMemberIds: [companyMember.id]
        });
        expect(session).toBeDefined();
        expect(session.interviewId).toBe(interview.id);
        expect(session.status).toBe("SCHEDULED");
        expect(session.participants).toHaveLength(2);
        const candidateParticipant = session.participants.find((p) => p.participantType === "CANDIDATE");
        expect(candidateParticipant).toBeDefined();
        expect(candidateParticipant.assignmentId).toBe(assignment.id);
        const interviewerParticipant = session.participants.find((p) => p.participantType === "INTERVIEWER");
        expect(interviewerParticipant).toBeDefined();
        expect(interviewerParticipant.companyMemberId).toBe(companyMember.id);
    });
    test("should get sessions for an interview", async () => {
        const { InterviewSessionsServices } = await import("../services/interviews.service.js");
        const sessions = await InterviewSessionsServices.getInterviewSessions(company.id, interview.id);
        expect(sessions).toBeDefined();
        expect(sessions.length).toBeGreaterThan(0);
        expect(sessions[0]?.id).toBe(session.id);
    });
    test("should update a session schedule", async () => {
        const { InterviewSessionsServices } = await import("../services/interviews.service.js");
        const newScheduledAt = new Date(Date.now() + 172800000).toISOString(); // Day after tomorrow
        const updated = await InterviewSessionsServices.updateSession(company.id, session.id, {
            scheduledAt: newScheduledAt
        });
        expect(updated).toBeDefined();
        expect(new Date(updated.scheduledAt).toISOString()).toBe(newScheduledAt);
    });
    test("should fail to remove participant if not found or session already started (simulated)", async () => {
        const { InterviewSessionParticipantsServices } = await import("../services/interviews.service.js");
        await expect(InterviewSessionParticipantsServices.removeParticipant(company.id, session.id, "fake-id")).rejects.toThrow("Participant not found");
    });
});
afterAll(async () => {
    await closeDatabase();
});
//# sourceMappingURL=interviews.service.test.js.map