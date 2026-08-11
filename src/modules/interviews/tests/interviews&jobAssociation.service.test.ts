import {
    describe,
    test,
    expect,
    beforeAll,
    afterAll,
} from "@jest/globals";
import prisma, { closeDatabase } from "../../../config/database.js";
import { InterviewsServices, JobInterviewsServices } from "../services/interviews&jobAssociation.service.js";
import { UserRole, CompanyStatus, InterviewType, InterviewMode } from "@prisma/client";

describe("Interviews API Service tests", () => {
    let employerUser: any;
    let company: any;
    let companyMember: any;

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

        const result = await InterviewsServices.createInterview(
            company.id,
            companyMember.id,
            interviewData
        );

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

        const result = await InterviewsServices.createInterview(
            company.id,
            companyMember.id,
            aiInterviewData
        );

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
            sortOrder: "desc" as const
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

        const result = await InterviewsServices.changeInterviewStatus(company.id, newInt.id, "ARCHIVED" as any);

        expect(result).toBeDefined();
        expect(result.id).toBe(newInt.id);
        expect(result.status).toBe("ARCHIVED");
    });
});

describe("JobInterviewsServices tests", () => {
    let employerUser: any;
    let company: any;
    let companyMember: any;
    let job: any;
    let interview1: any;
    let interview2: any;

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

afterAll(async () => {
    await closeDatabase();
});
