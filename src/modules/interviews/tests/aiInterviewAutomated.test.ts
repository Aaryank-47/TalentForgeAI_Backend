import {
    describe,
    test,
    expect,
    beforeAll,
    afterAll,
    beforeEach,
    afterEach,
    jest
} from "@jest/globals";
import { createServer, Server as HttpServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { io as ioc, Socket as ClientSocket } from "socket.io-client";
import prisma from "../../../config/database.js";
import { JwtHelper } from "../../../common/helper/jwt.helper.js";
import { OpenRouterClient } from "../../../common/integrations/openRouter/openrouter.client.js";
import {
    AIInterviewSessionService
} from "../AI-interview/services/ai.interview.service.js";
import { AIInterviewFinalEvaluationService } from "../AI-interview/services/ai.final.evaluation.service.js";
import { AIInterviewTimeoutWorker } from "../AI-interview/services/ai.timeout.service.js";
import { initializeInterviewSocket } from "../websocket/interview.socket.js";
import { seedInfosysTestData } from "./seedInfosysAIInterviewData.js";
import { UserRole } from "@prisma/client";

jest.setTimeout(25000);

describe("AI Interview Automated Test Suite", () => {
    let openRouterSpy: any;
    let seedData: Awaited<ReturnType<typeof seedInfosysTestData>>;
    let httpServer: HttpServer;
    let ioServer: SocketIOServer;
    let serverAddress: string;

    beforeAll(async () => {
        // 1. Seed fresh test database records for Infosys AI Interview
        seedData = await seedInfosysTestData();

        // 2. Start lightweight in-memory HTTP + Socket.IO server for Socket tests
        httpServer = createServer();
        ioServer = new SocketIOServer(httpServer, {
            cors: { origin: "*" }
        });
        initializeInterviewSocket(ioServer);

        await new Promise<void>((resolve) => {
            httpServer.listen(0, () => {
                const addr = httpServer.address() as any;
                serverAddress = `http://localhost:${addr.port}`;
                resolve();
            });
        });
    });

    afterAll(async () => {
        if (openRouterSpy) {
            openRouterSpy.mockRestore();
        }
        if (ioServer) {
            await ioServer.close();
        }
        if (httpServer) {
            await new Promise<void>((res) => httpServer.close(() => res()));
        }
    });

    beforeEach(() => {
        if (openRouterSpy) {
            openRouterSpy.mockRestore();
        }

        // Setup smart OpenRouter mock matching system/user prompts
        openRouterSpy = jest.spyOn(OpenRouterClient, "generateText").mockImplementation(async (prompt: any) => {
            const systemPromptStr = prompt.systemPrompt || "";
            const userPromptStr = prompt.userPrompt || "";

            // 1. Final Evaluation Prompt
            if (systemPromptStr.includes("final evaluator") || userPromptStr.includes("overall evaluation report")) {
                return JSON.stringify({
                    overallScore: 85,
                    recommendation: "STRONG_HIRE",
                    summary: "Candidate demonstrated excellent backend technical depth.",
                    strengths: ["Solid understanding of Node.js event loop & PostgreSQL indexing"],
                    weaknesses: ["Could improve concise communication"],
                    skillAssessment: [
                        {
                            skill: "Node.js",
                            score: 85,
                            feedback: "Strong grasp of event loop & async programming"
                        }
                    ]
                });
            }

            // 2. Question Generation Prompt (First Question or Next Main Question)
            if (
                systemPromptStr.includes("structured interview question") || 
                userPromptStr.includes("first structured interview question")
            ) {
                return JSON.stringify({
                    question: "Describe how you handle asynchronous operations in Node.js.",
                    topic: "Node.js Event Loop",
                    skill: "Node.js",
                    difficulty: "MEDIUM",
                    expectedAreas: ["Event loop phases", "Callbacks and Promises"]
                });
            }

            // 3. Question Progression / Answer Evaluation Prompt
            return JSON.stringify({
                evaluation: {
                    score: 80,
                    evaluation: "Good explanation of asynchronous I/O.",
                    strengths: ["Accurate terminology"],
                    weaknesses: ["Could elaborate on libuv worker pool"]
                },
                progression: {
                    shouldFollowUp: false,
                    reason: "No follow up needed",
                    followUpQuestion: null
                }
            });
        });
    });

    // =========================================================================
    // SECTION 1: UNIT TESTS
    // =========================================================================
    describe("1. Unit Tests (AIQuestionProgressionService & FinalEvaluationService)", () => {
        test("should generate a follow-up question when LLM indicates shouldFollowUp: true", async () => {
            openRouterSpy.mockImplementation(async (prompt: any) => {
                const systemPromptStr = prompt.systemPrompt || "";
                if (systemPromptStr.includes("structured interview question")) {
                    return JSON.stringify({
                        question: "Describe how you handle asynchronous operations in Node.js.",
                        topic: "Node.js Event Loop",
                        skill: "Node.js",
                        difficulty: "MEDIUM",
                        expectedAreas: ["Event loop phases"]
                    });
                }
                if (systemPromptStr.includes("evaluating a candidate's answer")) {
                    return JSON.stringify({
                        evaluation: {
                            score: 60,
                            evaluation: "Answer leaves gaps regarding threadpool management.",
                            strengths: ["Basic definition provided"],
                            weaknesses: ["Missing libuv worker pool details"]
                        },
                        progression: {
                            shouldFollowUp: true,
                            reason: "Clarify libuv worker pool size",
                            followUpQuestion: {
                                question: "Could you clarify how many threads are in the default libuv threadpool?",
                                topic: "Node.js Threadpool",
                                skill: "Node.js",
                                difficulty: "MEDIUM",
                                expectedAreas: ["Default 4 threads"]
                            }
                        }
                    });
                }
                return JSON.stringify({
                    question: "Describe how you handle asynchronous operations in Node.js.",
                    topic: "Node.js Event Loop",
                    skill: "Node.js",
                    difficulty: "MEDIUM",
                    expectedAreas: ["Event loop phases"]
                });
            });

            // Start session to obtain Question 1
            const startState = await AIInterviewSessionService.validateAndGetCurrentQuestion(
                seedData.normalSessionId,
                seedData.candidateUserId
            );
            expect(startState.status).toBe("IN_PROGRESS");
            expect(startState.question).toBeDefined();

            const q1Id = startState.question!.questionId;

            // Submit answer for Q1
            const submitResult = await AIInterviewSessionService.submitAnswer({
                userId: seedData.candidateUserId,
                sessionId: seedData.normalSessionId,
                questionId: q1Id,
                answerText: "Node.js uses libuv for asynchronous file and network I/O operations.",
                recordingUrl: null
            });

            expect(submitResult.answerSubmitted).toBe(true);
            expect(submitResult.completed).toBe(false);
            expect(submitResult.nextQuestion).toBeDefined();
            expect(submitResult.nextQuestion!.sequence).toBe(2); // Sequence computed dynamically
            expect(submitResult.nextQuestion!.question).toContain("libuv threadpool");
        });

        test("should generate the next main question when LLM indicates shouldFollowUp: false", async () => {
            openRouterSpy.mockImplementation(async (prompt: any) => {
                const systemPromptStr = prompt.systemPrompt || "";
                if (systemPromptStr.includes("structured interview question")) {
                    return JSON.stringify({
                        question: "How do B-tree indexes optimize query performance in PostgreSQL?",
                        topic: "Database Indexing",
                        skill: "PostgreSQL",
                        difficulty: "MEDIUM",
                        expectedAreas: ["B-tree structures"]
                    });
                }
                return JSON.stringify({
                    evaluation: {
                        score: 90,
                        evaluation: "Excellent answer detailing the 4 default threads in libuv.",
                        strengths: ["Accurate threadpool size", "Mentions UV_THREADPOOL_SIZE"],
                        weaknesses: []
                    },
                    progression: {
                        shouldFollowUp: false,
                        reason: "No follow up needed",
                        followUpQuestion: null
                    }
                });
            });

            // Get current unanswered question (the follow-up question generated above)
            const currentQuestion = await prisma.aIInterviewQuestion.findFirst({
                where: { sessionId: seedData.normalSessionId, answer: null },
                orderBy: { sequence: "asc" }
            });
            expect(currentQuestion).not.toBeNull();

            const result = await AIInterviewSessionService.submitAnswer({
                userId: seedData.candidateUserId,
                sessionId: seedData.normalSessionId,
                questionId: currentQuestion!.id,
                answerText: "The default threadpool size is 4, which can be configured via UV_THREADPOOL_SIZE.",
                recordingUrl: null
            });

            expect(result.answerSubmitted).toBe(true);
            expect(result.nextQuestion).toBeDefined();
            expect(result.nextQuestion!.sequence).toBe(3); // Advanced to Sequence 3
            expect(result.nextQuestion!.topic).toBe("Database Indexing");
        });

        test("should reject invalid or out-of-sequence question submissions", async () => {
            await expect(
                AIInterviewSessionService.submitAnswer({
                    userId: seedData.candidateUserId,
                    sessionId: seedData.normalSessionId,
                    questionId: "non-existent-question-id",
                    answerText: "Test answer",
                    recordingUrl: null
                })
            ).rejects.toThrow("Question not found in this session");
        });

        test("should prevent duplicate answer submissions for an already evaluated question", async () => {
            const evaluatedQuestion = await prisma.aIInterviewQuestion.findFirst({
                where: { sessionId: seedData.normalSessionId, answer: { evaluation: { isNot: null } } }
            });
            expect(evaluatedQuestion).not.toBeNull();

            await expect(
                AIInterviewSessionService.submitAnswer({
                    userId: seedData.candidateUserId,
                    sessionId: seedData.normalSessionId,
                    questionId: evaluatedQuestion!.id,
                    answerText: "Submitting answer second time",
                    recordingUrl: null
                })
            ).rejects.toThrow("Question already answered and evaluated");
        });

        test("should generate and persist final evaluation report correctly", async () => {
            const finalEval = await AIInterviewFinalEvaluationService.generateFinalEvaluation(seedData.normalSessionId);

            expect(finalEval).toBeDefined();
            expect(finalEval.overallScore).toBe(85);
            expect(finalEval.recommendation).toBe("STRONG_HIRE");
            expect(finalEval.sessionId).toBe(seedData.normalSessionId);

            // Verify persistence in PostgreSQL
            const savedDbRecord = await prisma.aIInterviewResult.findUnique({
                where: { sessionId: seedData.normalSessionId }
            });
            expect(savedDbRecord).not.toBeNull();
            expect(savedDbRecord!.overallScore).toBe(85);
        });
    });

    // =========================================================================
    // SECTION 2: INTEGRATION TESTS (POSTGRESQL PERSISTENCE)
    // =========================================================================
    describe("2. Integration Tests (PostgreSQL State Persistence)", () => {
        test("should correctly persist complete chain of questions, answers, evaluations, and session status in DB", async () => {
            const session = await prisma.interviewSession.findUnique({
                where: { id: seedData.normalSessionId },
                include: {
                    aiQuestions: {
                        include: {
                            answer: {
                                include: {
                                    evaluation: true
                                }
                            }
                        }
                    },
                    aiResult: true
                }
            });

            expect(session).not.toBeNull();
            expect(session!.aiQuestions.length).toBeGreaterThan(0);

            // Verify Question 1 has Answer and Evaluation saved
            const q1 = session!.aiQuestions[0]!;
            expect(q1).toBeDefined();
            expect(q1.answer).not.toBeNull();
            expect(q1.answer!.evaluation).not.toBeNull();
            expect(q1.answer!.answerText).toBeTruthy();
            expect(q1.answer!.evaluation!.score).toBeGreaterThanOrEqual(0);

            // Verify Final Evaluation report linked
            expect(session!.aiResult).not.toBeNull();
            expect(session!.aiResult!.sessionId).toBe(seedData.normalSessionId);
        });
    });

    // =========================================================================
    // SECTION 3: SOCKET.IO TESTS
    // =========================================================================
    describe("3. Socket.IO Client-Server Event Flow Tests", () => {
        let clientSocket: ClientSocket;

        afterEach(() => {
            if (clientSocket && clientSocket.connected) {
                clientSocket.disconnect();
            }
        });

        test("ai-interview-start -> returns initial question via ai-question event", async () => {
            clientSocket = ioc(`${serverAddress}/interviews/ai`, {
                auth: { token: seedData.candidateToken },
                transports: ["websocket"]
            });

            await new Promise<void>((resolve, reject) => {
                clientSocket.on("connect", () => resolve());
                clientSocket.on("connect_error", (err) => reject(err));
            });

            const questionPromise = new Promise<any>((resolve) => {
                clientSocket.on("ai-question", (data) => resolve(data));
            });

            clientSocket.emit("ai-interview-start", { sessionId: seedData.normalSessionId });

            const receivedQuestion = await questionPromise;
            expect(receivedQuestion).toBeDefined();
            expect(receivedQuestion.sessionId).toBe(seedData.normalSessionId);
            expect(receivedQuestion.questionId).toBeTruthy();
            expect(receivedQuestion.question).toBeTruthy();
        });

        test("ai-answer-submit -> returns ai-answer-received and next question", async () => {
            const assignment = await prisma.interviewAssignment.findFirst({
                where: { interviewId: seedData.interviewId }
            });
            const socketTestSession = await prisma.interviewSession.create({
                data: {
                    interviewId: seedData.interviewId,
                    status: "SCHEDULED",
                    scheduledAt: new Date(),
                    participants: {
                        create: {
                            assignmentId: assignment!.id,
                            participantType: "CANDIDATE"
                        }
                    }
                }
            });

            clientSocket = ioc(`${serverAddress}/interviews/ai`, {
                auth: { token: seedData.candidateToken },
                transports: ["websocket"]
            });

            await new Promise<void>((resolve, reject) => {
                clientSocket.on("connect", () => resolve());
                clientSocket.on("connect_error", (err) => reject(err));
            });

            // Step 1: Start session to get Q1
            const q1Promise = new Promise<any>((resolve) => {
                clientSocket.on("ai-question", (data) => resolve(data));
            });
            clientSocket.emit("ai-interview-start", { sessionId: socketTestSession.id });
            const q1Data = await q1Promise;

            // Step 2: Submit Answer for Q1
            const ackPromise = new Promise<any>((resolve) => {
                clientSocket.on("ai-answer-received", (data) => resolve(data));
            });
            const q2Promise = new Promise<any>((resolve) => {
                clientSocket.on("ai-question", (data) => resolve(data));
            });

            clientSocket.emit("ai-answer-submit", {
                sessionId: socketTestSession.id,
                questionId: q1Data.questionId,
                answerText: "In Django REST Framework, serializers convert querysets to JSON and validate inputs."
            });

            const ackData = await ackPromise;
            expect(ackData.submittedQuestionId).toBe(q1Data.questionId);
            expect(ackData.answerSubmitted).toBe(true);

            const q2Data = await q2Promise;
            expect(q2Data.sequence).toBe(2);
            expect(q2Data.topic).toBe("Node.js Event Loop");
        });

        test("ai-interview-end -> returns ai-interview-completed event", async () => {
            clientSocket = ioc(`${serverAddress}/interviews/ai`, {
                auth: { token: seedData.candidateToken },
                transports: ["websocket"]
            });

            await new Promise<void>((resolve, reject) => {
                clientSocket.on("connect", () => resolve());
                clientSocket.on("connect_error", (err) => reject(err));
            });

            const completedPromise = new Promise<any>((resolve) => {
                clientSocket.on("ai-interview-completed", (data) => resolve(data));
            });

            clientSocket.emit("ai-interview-end", { sessionId: seedData.normalSessionId });

            const completedData = await completedPromise;
            expect(completedData.completed).toBe(true);
            expect(completedData.sessionId).toBe(seedData.normalSessionId);
            expect(completedData.message).toContain("Thank you for completing");
        });

        test("unauthorized request with unassigned candidate token -> emits ai-interview-error", async () => {
            const userB = await prisma.user.create({
                data: {
                    email: `unauthorized_${Date.now()}@example.com`,
                    password: "Password@123",
                    role: UserRole.CANDIDATE,
                    status: "ACTIVE"
                }
            });
            const unassignedToken = JwtHelper.generateAccessToken({
                id: userB.id,
                email: userB.email,
                role: userB.role
            });

            clientSocket = ioc(`${serverAddress}/interviews/ai`, {
                auth: { token: unassignedToken },
                transports: ["websocket"]
            });

            await new Promise<void>((resolve, reject) => {
                clientSocket.on("connect", () => resolve());
                clientSocket.on("connect_error", (err) => reject(err));
            });

            const errorPromise = new Promise<any>((resolve) => {
                clientSocket.on("ai-interview-error", (data) => resolve(data));
            });

            clientSocket.emit("ai-interview-start", { sessionId: seedData.normalSessionId });

            const errorData = await errorPromise;
            expect(errorData.code).toBe("SESSION_INACTIVE");
            expect(errorData.message).toContain("not a participant");
        });
    });

    // =========================================================================
    // SECTION 4: TIMEOUT & WORKER TESTS
    // =========================================================================
    describe("4. Timeout Worker Tests (AIInterviewTimeoutWorker)", () => {
        test("should mark an expired IN_PROGRESS session as EXPIRED and trigger final evaluation report", async () => {
            // Create an IN_PROGRESS session started 35 minutes ago (duration: 30 minutes)
            const assignment = await prisma.interviewAssignment.findFirst({
                where: { interviewId: seedData.interviewId }
            });
            const expiredTestSession = await prisma.interviewSession.create({
                data: {
                    interviewId: seedData.interviewId,
                    status: "IN_PROGRESS",
                    scheduledAt: new Date(Date.now() - 40 * 60 * 1000),
                    startedAt: new Date(Date.now() - 35 * 60 * 1000),
                    participants: {
                        create: {
                            assignmentId: assignment!.id,
                            participantType: "CANDIDATE"
                        }
                    },
                    aiQuestions: {
                        create: {
                            sequence: 1,
                            question: "Sample backend technical question for timeout test",
                            topic: "Backend Systems",
                            skill: "Node.js",
                            difficulty: "MEDIUM",
                            answer: {
                                create: {
                                    answerText: "Partial response before timeout occurred.",
                                    answeredAt: new Date(Date.now() - 34 * 60 * 1000),
                                    evaluation: {
                                        create: {
                                            score: 50,
                                            feedback: "Partial answer before timeout",
                                            strengths: ["Attempted response"],
                                            weaknesses: ["Incomplete answer"]
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            // Run timeout worker check scan
            await AIInterviewTimeoutWorker.checkAndExpireSessions();

            // Verify session state in PostgreSQL
            const updatedSession = await prisma.interviewSession.findUnique({
                where: { id: expiredTestSession.id },
                include: { aiResult: true }
            });

            expect(updatedSession).not.toBeNull();
            expect(updatedSession!.status).toBe("EXPIRED");
            expect(updatedSession!.endedAt).not.toBeNull();
            expect(updatedSession!.aiResult).not.toBeNull();
            expect(updatedSession!.aiResult!.overallScore).toBe(85);
        });
    });
});
