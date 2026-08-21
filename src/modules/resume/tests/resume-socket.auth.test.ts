import {
    describe,
    test,
    expect,
    beforeAll,
    afterAll,
    afterEach,
    jest
} from "@jest/globals";
import { createServer, Server as HttpServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { io as ioc, Socket as ClientSocket } from "socket.io-client";
import prisma from "../../../config/database.js";
import { JwtHelper } from "../../../common/helper/jwt.helper.js";
import { initializeResumeSocket } from "../websocket/resume.socket.js";
import { ResumeProgressPublisher } from "../websocket/resume-progress.publisher.js";
import {
    RESUME_SOCKET_EVENTS,
    RESUME_SOCKET_NAMESPACE
} from "../websocket/resume-socket.constants.js";
import type {
    ResumeCompletedEventPayload,
    ResumeFailedEventPayload,
    ResumeSocketErrorPayload,
    ResumeStageEventPayload,
    ResumeSubscribedResponsePayload
} from "../websocket/resume-socket.types.js";

describe("Resume Processing Socket.IO - Unit & Authorization Suite", () => {
    let httpServer: HttpServer;
    let ioServer: SocketIOServer;
    let serverAddress: string;

    const mockCandidateA = {
        id: "candidate-socket-auth-1",
        email: "candidate.a@test.com",
        role: "CANDIDATE"
    };

    const mockCandidateB = {
        id: "candidate-socket-auth-2",
        email: "candidate.b@test.com",
        role: "CANDIDATE"
    };

    let tokenCandidateA: string;
    let tokenCandidateB: string;

    beforeAll(async () => {
        tokenCandidateA = JwtHelper.generateAccessToken(mockCandidateA as any);
        tokenCandidateB = JwtHelper.generateAccessToken(mockCandidateB as any);

        httpServer = createServer();
        ioServer = new SocketIOServer(httpServer, {
            cors: { origin: "*" }
        });

        initializeResumeSocket(ioServer);

        await new Promise<void>((resolve) => {
            httpServer.listen(0, () => {
                const addr = httpServer.address() as any;
                serverAddress = `http://localhost:${addr.port}`;
                resolve();
            });
        });
    });

    afterAll(async () => {
        if (ioServer) {
            await ioServer.close();
        }
        if (httpServer) {
            await new Promise<void>((resolve) => httpServer.close(() => resolve()));
        }
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("Socket Authentication", () => {
        test("rejects connection when no JWT token is provided", async () => {
            const client = ioc(`${serverAddress}${RESUME_SOCKET_NAMESPACE}`, {
                transports: ["websocket"],
                autoConnect: true
            });

            const errorPromise = new Promise<string>((resolve) => {
                client.on("connect_error", (err) => {
                    resolve(err.message);
                });
            });

            const error = await errorPromise;
            expect(error).toMatch(/Authentication error/i);
            client.disconnect();
        });

        test("rejects connection when invalid JWT token is provided", async () => {
            const client = ioc(`${serverAddress}${RESUME_SOCKET_NAMESPACE}`, {
                auth: { token: "invalid-expired-jwt-token" },
                transports: ["websocket"]
            });

            const errorPromise = new Promise<string>((resolve) => {
                client.on("connect_error", (err) => {
                    resolve(err.message);
                });
            });

            const error = await errorPromise;
            expect(error).toMatch(/Authentication error/i);
            client.disconnect();
        });

        test("successfully authenticates and connects with valid JWT token", async () => {
            const client = ioc(`${serverAddress}${RESUME_SOCKET_NAMESPACE}`, {
                auth: { token: tokenCandidateA },
                transports: ["websocket"]
            });

            const connectPromise = new Promise<boolean>((resolve) => {
                client.on("connect", () => {
                    resolve(true);
                });
            });

            const connected = await connectPromise;
            expect(connected).toBe(true);
            client.disconnect();
        });
    });

    describe("Authorization & Room Subscription", () => {
        test("rejects subscription when payload is invalid", async () => {
            const client = ioc(`${serverAddress}${RESUME_SOCKET_NAMESPACE}`, {
                auth: { token: tokenCandidateA },
                transports: ["websocket"]
            });

            await new Promise<void>((res) => {
                client.on("connect", () => res());
            });

            const errorPromise = new Promise<ResumeSocketErrorPayload>((resolve) => {
                client.on(RESUME_SOCKET_EVENTS.ERROR, (data) => resolve(data));
            });

            client.emit(RESUME_SOCKET_EVENTS.SUBSCRIBE, {});

            const errorData = await errorPromise;
            expect(errorData.code).toBe("INVALID_PAYLOAD");
            client.disconnect();
        });

        test("rejects subscription when resume does not exist in DB", async () => {
            jest.spyOn(prisma.resume, "findUnique").mockResolvedValue(null as any);
            jest.spyOn(prisma.candidate, "findUnique").mockResolvedValue(null as any);

            const client = ioc(`${serverAddress}${RESUME_SOCKET_NAMESPACE}`, {
                auth: { token: tokenCandidateA },
                transports: ["websocket"]
            });

            await new Promise<void>((res) => {
                client.on("connect", () => res());
            });

            const errorPromise = new Promise<ResumeSocketErrorPayload>((resolve) => {
                client.on(RESUME_SOCKET_EVENTS.ERROR, (data) => resolve(data));
            });

            client.emit(RESUME_SOCKET_EVENTS.SUBSCRIBE, { resumeId: "non-existent-resume" });

            const errorData = await errorPromise;
            expect(errorData.code).toBe("NOT_FOUND");
            client.disconnect();
        });

        test("rejects subscription when candidate does not own the resume", async () => {
            // Resume belongs to candidate B
            jest.spyOn(prisma.resume, "findUnique").mockResolvedValue({
                id: "resume-candidate-b-1",
                candidateId: mockCandidateB.id,
                parsingStatus: "QUEUED",
                parsingStartedAt: null,
                parsingCompletedAt: null
            } as any);

            jest.spyOn(prisma.candidate, "findUnique").mockResolvedValue({
                id: mockCandidateA.id
            } as any);

            // Client connects as candidate A
            const clientA = ioc(`${serverAddress}${RESUME_SOCKET_NAMESPACE}`, {
                auth: { token: tokenCandidateA },
                transports: ["websocket"]
            });

            await new Promise<void>((res) => {
                clientA.on("connect", () => res());
            });

            const errorPromise = new Promise<ResumeSocketErrorPayload>((resolve) => {
                clientA.on(RESUME_SOCKET_EVENTS.ERROR, (data) => resolve(data));
            });

            clientA.emit(RESUME_SOCKET_EVENTS.SUBSCRIBE, { resumeId: "resume-candidate-b-1" });

            const errorData = await errorPromise;
            expect(errorData.code).toBe("UNAUTHORIZED");
            expect(errorData.message).toMatch(/not authorized/i);
            clientA.disconnect();
        });

        test("allows candidate to subscribe to their own resume and receive real-time stage events", async () => {
            const resumeId = "resume-candidate-a-1";

            jest.spyOn(prisma.resume, "findUnique").mockResolvedValue({
                id: resumeId,
                candidateId: mockCandidateA.id,
                parsingStatus: "QUEUED",
                parsingStartedAt: null,
                parsingCompletedAt: null
            } as any);

            jest.spyOn(prisma.candidate, "findUnique").mockResolvedValue({
                id: mockCandidateA.id
            } as any);

            const clientA = ioc(`${serverAddress}${RESUME_SOCKET_NAMESPACE}`, {
                auth: { token: tokenCandidateA },
                transports: ["websocket"]
            });

            await new Promise<void>((res) => {
                clientA.on("connect", () => res());
            });

            const subscribedPromise = new Promise<ResumeSubscribedResponsePayload>((resolve) => {
                clientA.on(RESUME_SOCKET_EVENTS.SUBSCRIBED, (data) => resolve(data));
            });

            clientA.emit(RESUME_SOCKET_EVENTS.SUBSCRIBE, { resumeId });

            const subscribedData = await subscribedPromise;
            expect(subscribedData.resumeId).toBe(resumeId);
            expect(subscribedData.status).toBe("QUEUED");
            expect(subscribedData.currentStage).toBe("QUEUED");

            // Now test live progress publisher events received by room subscriber
            const stageEvents: ResumeStageEventPayload[] = [];
            const completedPromise = new Promise<ResumeCompletedEventPayload>((resolve) => {
                clientA.on(RESUME_SOCKET_EVENTS.STAGE_CHANGE, (payload: ResumeStageEventPayload) => {
                    stageEvents.push(payload);
                });
                clientA.on(RESUME_SOCKET_EVENTS.COMPLETED, (payload: ResumeCompletedEventPayload) => {
                    resolve(payload);
                });
            });

            // Simulate publisher emitting stages (stages 1-5 via publishStageChange, completion via publishCompleted)
            await ResumeProgressPublisher.publishStageChange("FETCHING_FILE", {
                jobId: "job-101",
                resumeId,
                candidateId: mockCandidateA.id
            });

            await ResumeProgressPublisher.publishStageChange("EXTRACTION", {
                jobId: "job-101",
                resumeId,
                candidateId: mockCandidateA.id,
                mode: "FALLBACK",
                reason: "OpenRouter token limit exceeded"
            });

            await ResumeProgressPublisher.publishStageChange("AI_PARSING", {
                jobId: "job-101",
                resumeId,
                candidateId: mockCandidateA.id,
                mode: "FALLBACK"
            });

            await ResumeProgressPublisher.publishStageChange("NORMALIZATION", {
                jobId: "job-101",
                resumeId,
                candidateId: mockCandidateA.id
            });

            await ResumeProgressPublisher.publishStageChange("PERSISTENCE", {
                jobId: "job-101",
                resumeId,
                candidateId: mockCandidateA.id
            });

            await ResumeProgressPublisher.publishCompleted({
                jobId: "job-101",
                resumeId,
                candidateId: mockCandidateA.id
            });

            const completedData = await completedPromise;

            expect(stageEvents.length).toBe(5);
            expect(stageEvents.map((e) => e.stage)).toEqual([
                "FETCHING_FILE",
                "EXTRACTION",
                "AI_PARSING",
                "NORMALIZATION",
                "PERSISTENCE"
            ]);

            // Verify targeted sanitization on fallback reason (OpenRouter mention sanitized)
            const extractionEvent = stageEvents.find((e) => e.stage === "EXTRACTION");
            expect(extractionEvent?.mode).toBe("FALLBACK");
            expect(extractionEvent?.reason).toBe("Optimized document processing mode activated");

            expect(completedData.stage).toBe("COMPLETED");
            expect(completedData.resumeId).toBe(resumeId);

            clientA.disconnect();
        });

        test("late subscriber receives current processing stage and timestamps upon subscription", async () => {
            const resumeId = "resume-late-subscriber-1";
            const startedAt = new Date(Date.now() - 5000);

            jest.spyOn(prisma.resume, "findUnique").mockResolvedValue({
                id: resumeId,
                candidateId: mockCandidateA.id,
                parsingStatus: "PROCESSING",
                parsingStartedAt: startedAt,
                parsingCompletedAt: null
            } as any);

            jest.spyOn(prisma.candidate, "findUnique").mockResolvedValue({
                id: mockCandidateA.id
            } as any);

            const clientA = ioc(`${serverAddress}${RESUME_SOCKET_NAMESPACE}`, {
                auth: { token: tokenCandidateA },
                transports: ["websocket"]
            });

            await new Promise<void>((res) => {
                clientA.on("connect", () => res());
            });

            const subscribedPromise = new Promise<ResumeSubscribedResponsePayload>((resolve) => {
                clientA.on(RESUME_SOCKET_EVENTS.SUBSCRIBED, (data) => resolve(data));
            });

            clientA.emit(RESUME_SOCKET_EVENTS.SUBSCRIBE, { resumeId });

            const subscribedData = await subscribedPromise;
            expect(subscribedData.resumeId).toBe(resumeId);
            expect(subscribedData.status).toBe("PROCESSING");
            expect(subscribedData.currentStage).toBe("AI_PARSING");
            expect(subscribedData.parsingStartedAt).toBe(startedAt.toISOString());

            clientA.disconnect();
        });

        test("room isolation: Candidate B does NOT receive events for Candidate A's resume", async () => {
            const resumeIdA = "resume-candidate-a-isolated";
            const resumeIdB = "resume-candidate-b-isolated";

            jest.spyOn(prisma.resume as any, "findUnique").mockImplementation(async (args: any) => {
                if (args.where.id === resumeIdA) {
                    return { id: resumeIdA, candidateId: mockCandidateA.id, parsingStatus: "QUEUED", parsingStartedAt: null, parsingCompletedAt: null };
                }
                if (args.where.id === resumeIdB) {
                    return { id: resumeIdB, candidateId: mockCandidateB.id, parsingStatus: "QUEUED", parsingStartedAt: null, parsingCompletedAt: null };
                }
                return null;
            });

            jest.spyOn(prisma.candidate as any, "findUnique").mockImplementation(async (args: any) => {
                if (args.where.userId === mockCandidateA.id) {
                    return { id: mockCandidateA.id };
                }
                if (args.where.userId === mockCandidateB.id) {
                    return { id: mockCandidateB.id };
                }
                return null;
            });

            const clientA = ioc(`${serverAddress}${RESUME_SOCKET_NAMESPACE}`, {
                auth: { token: tokenCandidateA },
                transports: ["websocket"]
            });
            const clientB = ioc(`${serverAddress}${RESUME_SOCKET_NAMESPACE}`, {
                auth: { token: tokenCandidateB },
                transports: ["websocket"]
            });

            await Promise.all([
                new Promise<void>((res) => clientA.on("connect", () => res())),
                new Promise<void>((res) => clientB.on("connect", () => res()))
            ]);

            // Client A subscribes to Resume A
            clientA.emit(RESUME_SOCKET_EVENTS.SUBSCRIBE, { resumeId: resumeIdA });
            // Client B subscribes to Resume B
            clientB.emit(RESUME_SOCKET_EVENTS.SUBSCRIBE, { resumeId: resumeIdB });

            await new Promise((resolve) => setTimeout(resolve, 50));

            const candidateBEvents: any[] = [];
            clientB.on(RESUME_SOCKET_EVENTS.STAGE_CHANGE, (data) => candidateBEvents.push(data));
            clientB.on(RESUME_SOCKET_EVENTS.COMPLETED, (data) => candidateBEvents.push(data));

            // Publish events for Resume A only
            await ResumeProgressPublisher.publishStageChange("FETCHING_FILE", {
                jobId: "job-iso-1",
                resumeId: resumeIdA,
                candidateId: mockCandidateA.id
            });

            await ResumeProgressPublisher.publishCompleted({
                jobId: "job-iso-1",
                resumeId: resumeIdA,
                candidateId: mockCandidateA.id
            });

            await new Promise((resolve) => setTimeout(resolve, 50));

            // Candidate B received 0 events for Resume A
            expect(candidateBEvents.length).toBe(0);

            clientA.disconnect();
            clientB.disconnect();
        });

        test("publishes final failure event when resume fails permanently", async () => {
            const resumeId = "resume-candidate-a-fail";

            jest.spyOn(prisma.resume, "findUnique").mockResolvedValue({
                id: resumeId,
                candidateId: mockCandidateA.id,
                parsingStatus: "QUEUED",
                parsingStartedAt: null,
                parsingCompletedAt: null
            } as any);

            jest.spyOn(prisma.candidate, "findUnique").mockResolvedValue({
                id: mockCandidateA.id
            } as any);

            const clientA = ioc(`${serverAddress}${RESUME_SOCKET_NAMESPACE}`, {
                auth: { token: tokenCandidateA },
                transports: ["websocket"]
            });

            await new Promise<void>((res) => {
                clientA.on("connect", () => res());
            });

            clientA.emit(RESUME_SOCKET_EVENTS.SUBSCRIBE, { resumeId });
            await new Promise((resolve) => setTimeout(resolve, 50));

            const failedPromise = new Promise<ResumeFailedEventPayload>((resolve) => {
                clientA.on(RESUME_SOCKET_EVENTS.FAILED, (data: ResumeFailedEventPayload) => resolve(data));
            });

            await ResumeProgressPublisher.publishFinalFailure(
                {
                    jobId: "job-failed-1",
                    resumeId,
                    candidateId: mockCandidateA.id
                },
                "Document format is corrupt or scanned image"
            );

            const failedData = await failedPromise;
            expect(failedData.stage).toBe("FAILED");
            expect(failedData.resumeId).toBe(resumeId);
            expect(failedData.error).toBe("Document format is corrupt or scanned image");

            clientA.disconnect();
        });

        test("resilience: publisher failure never throws or breaks execution", async () => {
            // Force publisher emission error by destroying namespace reference temporarily
            const originalNsp = ResumeProgressPublisher.getNamespace();
            ResumeProgressPublisher.setNamespace({
                to: () => {
                    throw new Error("Socket pipe broken");
                }
            } as any);

            await expect(
                ResumeProgressPublisher.publishStageChange("AI_PARSING", {
                    jobId: "job-error",
                    resumeId: "resume-err",
                    candidateId: "candidate-err"
                })
            ).resolves.toBeUndefined();

            await expect(
                ResumeProgressPublisher.publishCompleted({
                    jobId: "job-error",
                    resumeId: "resume-err",
                    candidateId: "candidate-err"
                })
            ).resolves.toBeUndefined();

            await expect(
                ResumeProgressPublisher.publishFinalFailure(
                    { jobId: "job-error", resumeId: "resume-err", candidateId: "candidate-err" },
                    "Some error"
                )
            ).resolves.toBeUndefined();

            if (originalNsp) {
                ResumeProgressPublisher.setNamespace(originalNsp);
            }
        });
    });
});
