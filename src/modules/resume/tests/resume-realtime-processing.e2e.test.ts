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
import { ResumeProcessingWorker } from "../queues/resume-processing.worker.js";
import { ResumeProcessingPipeline } from "../pipelines/resume-processing.pipeline.js";
import {
    RESUME_SOCKET_EVENTS,
    RESUME_SOCKET_NAMESPACE
} from "../websocket/resume-socket.constants.js";
import type {
    ResumeCompletedEventPayload,
    ResumeStageEventPayload
} from "../websocket/resume-socket.types.js";

describe("Resume Real-Time Processing End-to-End Pipeline & Socket Test", () => {
    let httpServer: HttpServer;
    let ioServer: SocketIOServer;
    let serverAddress: string;
    const connectedSockets: ClientSocket[] = [];

    const mockCandidate = {
        id: "candidate-e2e-realtime-1",
        email: "candidate.e2e@talentforge.ai",
        role: "CANDIDATE"
    };

    let candidateToken: string;

    beforeAll(async () => {
        candidateToken = JwtHelper.generateAccessToken(mockCandidate as any);

        httpServer = createServer();
        ioServer = new SocketIOServer(httpServer, {
            cors: { origin: "*" }
        });

        // Initialize Socket.IO namespace and register with publisher
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
        for (const socket of connectedSockets) {
            if (socket.connected) {
                socket.disconnect();
            }
        }
        connectedSockets.length = 0;

        if (ioServer) {
            await ioServer.close();
        }
        if (httpServer) {
            await new Promise<void>((resolve) => httpServer.close(() => resolve()));
        }
        const { closeResumeProcessingQueue } = await import("../queues/resume-processing.queue.js");
        const { closeMatchingQueue } = await import("../../matching/queues/matching.queue.js");
        await closeResumeProcessingQueue();
        await closeMatchingQueue();
    });

    afterEach(() => {
        for (const socket of connectedSockets) {
            if (socket.connected) {
                socket.disconnect();
            }
        }
        connectedSockets.length = 0;
        jest.restoreAllMocks();
    });

    test("End-to-End flow: Candidate connects -> Subscribes -> Worker processes job -> Pipeline executes stages -> Client receives all stage events -> Completion event -> REST state is authoritative", async () => {
        const resumeId = "resume-e2e-101";
        const jobId = "bullmq-job-202";

        // 1. Mock DB state for the candidate's resume
        const resumeDbRecord = {
            id: resumeId,
            candidateId: mockCandidate.id,
            fileUrl: "https://mock-storage.talentforge.ai/resumes/john_doe.pdf",
            mimeType: "application/pdf",
            fileType: "application/pdf",
            parsingStatus: "QUEUED",
            parsingStartedAt: null as Date | null,
            parsingCompletedAt: null as Date | null,
            parsingError: null as string | null
        };

        jest.spyOn(prisma.resume as any, "findUnique").mockImplementation(async (args: any) => {
            if (args.where.id === resumeId) {
                return resumeDbRecord;
            }
            return null;
        });

        jest.spyOn(prisma.candidate as any, "findUnique").mockImplementation(async (args: any) => {
            if (args.where.userId === mockCandidate.id) {
                return { id: mockCandidate.id };
            }
            return null;
        });

        jest.spyOn(prisma.resume as any, "update").mockImplementation(async (args: any) => {
            if (args.where.id === resumeId) {
                Object.assign(resumeDbRecord, args.data);
                return resumeDbRecord;
            }
            return null;
        });

        // 2. Mock Pipeline service dependencies so it exercises real multi-stage pipeline flow
        const mockFileFetcher = jest.fn<(url: string) => Promise<Buffer>>().mockResolvedValue(Buffer.from("%PDF-1.4 Mock PDF Content"));
        const mockDocExtractor = {
            extractDocument: jest.fn<any>().mockResolvedValue({
                text: "John Doe\nSoftware Engineer\nSkills: TypeScript, Node.js",
                pageCount: 1,
                wordCount: 10
            })
        };
        const mockParserService = {
            parseResumeDocument: jest.fn<any>().mockResolvedValue({
                personal: { fullName: "John Doe", email: "john@talentforge.ai" },
                professional: { headline: "Senior Backend Engineer" },
                skills: [{ name: "TypeScript" }, { name: "PostgreSQL" }],
                experience: [],
                education: [],
                projects: [],
                certifications: []
            }),
            parseResumeText: jest.fn<any>()
        };
        const mockNormalizationService = {
            normalizeResumeData: jest.fn<any>().mockImplementation(async (data: any) => data)
        };
        const mockPersistenceService = {
            persistResumeData: jest.fn<any>().mockResolvedValue({
                candidateId: mockCandidate.id,
                skillsCreated: 2,
                skillsUpdated: 0,
                experiencesCreated: 0,
                experiencesUpdated: 0,
                educationCreated: 0,
                educationUpdated: 0,
                projectsCreated: 0,
                projectsUpdated: 0,
                certificationsCreated: 0,
                certificationsUpdated: 0
            })
        };

        const pipeline = new ResumeProcessingPipeline(
            mockDocExtractor as any,
            mockParserService as any,
            mockNormalizationService as any,
            mockPersistenceService as any,
            mockFileFetcher
        );

        // Instantiates worker wired with real ResumeProgressPublisher
        const worker = new ResumeProcessingWorker(pipeline);

        // 3. Connect Candidate Client over Socket.IO
        const candidateClient = ioc(`${serverAddress}${RESUME_SOCKET_NAMESPACE}`, {
            auth: { token: candidateToken },
            transports: ["websocket"]
        });
        connectedSockets.push(candidateClient);

        await new Promise<void>((res) => {
            candidateClient.on("connect", () => res());
        });

        // 4. Candidate Subscribes to their resume
        const subscribedPromise = new Promise<any>((resolve) => {
            candidateClient.on(RESUME_SOCKET_EVENTS.SUBSCRIBED, resolve);
        });

        candidateClient.emit(RESUME_SOCKET_EVENTS.SUBSCRIBE, { resumeId });
        const subAck = await subscribedPromise;
        expect(subAck.resumeId).toBe(resumeId);

        // 5. Setup event listener for real-time progress stream
        const receivedStages: ResumeStageEventPayload[] = [];
        let completedEventPayload: ResumeCompletedEventPayload | null = null;

        candidateClient.on(RESUME_SOCKET_EVENTS.STAGE_CHANGE, (payload: ResumeStageEventPayload) => {
            receivedStages.push(payload);
        });

        const completionPromise = new Promise<ResumeCompletedEventPayload>((resolve) => {
            candidateClient.on(RESUME_SOCKET_EVENTS.COMPLETED, (payload: ResumeCompletedEventPayload) => {
                completedEventPayload = payload;
                resolve(payload);
            });
        });

        // 6. BullMQ Worker processes the job
        const mockBullJob: any = {
            id: jobId,
            data: {
                candidateId: mockCandidate.id,
                resumeId,
                fileReference: resumeDbRecord.fileUrl,
                mimeType: resumeDbRecord.mimeType
            },
            attemptsMade: 0,
            opts: { attempts: 3 }
        };

        const jobResult = await worker.processJob(mockBullJob);
        expect(jobResult.success).toBe(true);

        // 7. Await and verify Socket.IO real-time delivery
        const completionResult = await completionPromise;

        expect(completionResult.stage).toBe("COMPLETED");
        expect(completionResult.resumeId).toBe(resumeId);

        // Verify the exact sequential stages delivered over Socket.IO (stages 1-5 emitted by pipeline via stageChange, completion emitted by worker)
        const stageNames = receivedStages.map((e) => e.stage);
        expect(stageNames).toEqual([
            "FETCHING_FILE",
            "AI_PARSING",
            "NORMALIZATION",
            "PERSISTENCE"
        ]);

        // Verify payload metadata
        expect(receivedStages[0]?.resumeId).toBe(resumeId);
        expect(receivedStages[0]?.candidateId).toBe(mockCandidate.id);
        expect(receivedStages[0]?.message).toBe("Fetching resume document");
        expect(receivedStages[1]?.mode).toBe("DIRECT");

        // 8. Verify Authoritative State in Database
        expect(resumeDbRecord.parsingStatus).toBe("COMPLETED");
        expect(resumeDbRecord.parsingCompletedAt).toBeInstanceOf(Date);
        expect(resumeDbRecord.parsingError).toBeNull();

        candidateClient.disconnect();
    });
});
