import {
    describe,
    test,
    expect,
    beforeAll,
    afterAll,
} from "@jest/globals";
import prisma, { closeDatabase } from "../../../config/database.js";
import { InterviewsServices } from "../services/interviews&jobAssociation.service.js";
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

    afterAll(async () => {
        await closeDatabase();
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
});
