import { describe, test, expect, beforeAll, afterAll, afterEach, jest } from "@jest/globals";
import { createServer, Server as HttpServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { io as ioc } from "socket.io-client";
import prisma from "../../../config/database.js";
import { JwtHelper } from "../../../common/helper/jwt.helper.js";
import { initializeResumeSocket } from "../websocket/resume.socket.js";
import { ResumeProgressPublisher } from "../websocket/resume-progress.publisher.js";
import { ResumeProcessingWorker } from "../queues/resume-processing.worker.js";
import { ResumeProcessingPipeline } from "../pipelines/resume-processing.pipeline.js";
import { RESUME_SOCKET_EVENTS, RESUME_SOCKET_NAMESPACE } from "../websocket/resume-socket.constants.js";
import { OpenRouterError } from "../../../common/integrations/openRouter/errors/openrouter.error.js";
import { UnsupportedFileTypeError } from "../errors/document-extraction.errors.js";
describe("Resume Processing Module — Complete Orchestration & E2E Scenarios (A through J)", () => {
    let httpServer;
    let ioServer;
    let serverAddress;
    const mockCandidateA = {
        id: "candidate-orch-user-a",
        email: "candidate.orch.a@talentforge.ai",
        role: "CANDIDATE"
    };
    const mockCandidateB = {
        id: "candidate-orch-user-b",
        email: "candidate.orch.b@talentforge.ai",
        role: "CANDIDATE"
    };
    let tokenCandidateA;
    let tokenCandidateB;
    beforeAll(async () => {
        tokenCandidateA = JwtHelper.generateAccessToken(mockCandidateA);
        tokenCandidateB = JwtHelper.generateAccessToken(mockCandidateB);
        httpServer = createServer();
        ioServer = new SocketIOServer(httpServer, {
            cors: { origin: "*" }
        });
        initializeResumeSocket(ioServer);
        await new Promise((resolve) => {
            httpServer.listen(0, () => {
                const addr = httpServer.address();
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
            await new Promise((resolve) => httpServer.close(() => resolve()));
        }
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    // =========================================================================
    // Scenario A: Successful DOCX Resume Orchestration
    // =========================================================================
    test("Scenario A: Successful DOCX resume -> Extraction -> AI -> Normalization -> Persistence -> COMPLETED -> Socket events", async () => {
        const resumeId = "resume-docx-success-1";
        const jobId = "job-docx-101";
        const resumeDbRecord = {
            id: resumeId,
            candidateId: mockCandidateA.id,
            fileUrl: "https://storage.talentforge.ai/resumes/john.docx",
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            parsingStatus: "QUEUED",
            parsingStartedAt: null,
            parsingCompletedAt: null,
            parsingError: null
        };
        jest.spyOn(prisma.resume, "findUnique").mockImplementation(async (args) => {
            if (args.where.id === resumeId)
                return resumeDbRecord;
            return null;
        });
        jest.spyOn(prisma.candidate, "findUnique").mockImplementation(async (args) => {
            if (args.where.userId === mockCandidateA.id)
                return { id: mockCandidateA.id };
            return null;
        });
        jest.spyOn(prisma.resume, "update").mockImplementation(async (args) => {
            if (args.where.id === resumeId) {
                Object.assign(resumeDbRecord, args.data);
                return resumeDbRecord;
            }
            return null;
        });
        const mockFileFetcher = jest.fn().mockResolvedValue(Buffer.from("mock-docx-bytes"));
        const mockDocExtractor = {
            extractDocument: jest.fn().mockResolvedValue({
                text: "John Doe\nStaff Engineer\nSkills: TypeScript, BullMQ",
                pageCount: 1,
                wordCount: 8
            })
        };
        const mockParserService = {
            parseResumeDocument: jest.fn(),
            parseResumeText: jest.fn().mockResolvedValue({
                personal: { fullName: "John Doe", email: "john@talentforge.ai" },
                professional: { headline: "Staff Engineer" },
                skills: [{ name: "TypeScript" }, { name: "BullMQ" }],
                experience: [],
                education: [],
                projects: [],
                certifications: []
            })
        };
        const mockNormalizationService = {
            normalizeResumeData: jest.fn().mockImplementation(async (data) => data)
        };
        const mockPersistenceService = {
            persistResumeData: jest.fn().mockResolvedValue({
                candidateId: mockCandidateA.id,
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
        const pipeline = new ResumeProcessingPipeline(mockDocExtractor, mockParserService, mockNormalizationService, mockPersistenceService, mockFileFetcher);
        const worker = new ResumeProcessingWorker(pipeline);
        const client = ioc(`${serverAddress}${RESUME_SOCKET_NAMESPACE}`, {
            auth: { token: tokenCandidateA },
            transports: ["websocket"]
        });
        await new Promise((res) => client.on("connect", () => res()));
        client.emit(RESUME_SOCKET_EVENTS.SUBSCRIBE, { resumeId });
        await new Promise((resolve) => setTimeout(resolve, 50));
        const stageEvents = [];
        client.on(RESUME_SOCKET_EVENTS.STAGE_CHANGE, (payload) => {
            stageEvents.push(payload);
        });
        const completedPromise = new Promise((resolve) => {
            client.on(RESUME_SOCKET_EVENTS.COMPLETED, resolve);
        });
        const jobResult = await worker.processJob({
            id: jobId,
            data: {
                candidateId: mockCandidateA.id,
                resumeId,
                fileReference: resumeDbRecord.fileUrl,
                mimeType: resumeDbRecord.mimeType
            },
            attemptsMade: 0,
            opts: { attempts: 3 }
        });
        expect(jobResult.success).toBe(true);
        expect(jobResult.skillsCount).toBe(2);
        const completedPayload = await completedPromise;
        expect(completedPayload.stage).toBe("COMPLETED");
        // Verify DOCX specific stages: FETCHING_FILE -> EXTRACTION (DIRECT) -> AI_PARSING (DIRECT) -> NORMALIZATION -> PERSISTENCE
        expect(stageEvents.map((e) => e.stage)).toEqual([
            "FETCHING_FILE",
            "EXTRACTION",
            "AI_PARSING",
            "NORMALIZATION",
            "PERSISTENCE"
        ]);
        expect(stageEvents[1]?.mode).toBe("DIRECT");
        expect(stageEvents[2]?.mode).toBe("DIRECT");
        expect(resumeDbRecord.parsingStatus).toBe("COMPLETED");
        expect(resumeDbRecord.parsingCompletedAt).toBeInstanceOf(Date);
        client.disconnect();
    });
    // =========================================================================
    // Scenario B: Successful PDF Direct AI Parsing
    // =========================================================================
    test("Scenario B: Successful PDF direct AI parsing -> Direct AI -> Normalization -> Persistence -> COMPLETED", async () => {
        const resumeId = "resume-pdf-direct-1";
        const jobId = "job-pdf-direct-101";
        const resumeDbRecord = {
            id: resumeId,
            candidateId: mockCandidateA.id,
            fileUrl: "https://storage.talentforge.ai/resumes/jane.pdf",
            mimeType: "application/pdf",
            parsingStatus: "QUEUED",
            parsingStartedAt: null,
            parsingCompletedAt: null,
            parsingError: null
        };
        jest.spyOn(prisma.resume, "findUnique").mockImplementation(async (args) => {
            if (args.where.id === resumeId)
                return resumeDbRecord;
            return null;
        });
        jest.spyOn(prisma.candidate, "findUnique").mockImplementation(async (args) => {
            if (args.where.userId === mockCandidateA.id)
                return { id: mockCandidateA.id };
            return null;
        });
        jest.spyOn(prisma.resume, "update").mockImplementation(async (args) => {
            if (args.where.id === resumeId) {
                Object.assign(resumeDbRecord, args.data);
                return resumeDbRecord;
            }
            return null;
        });
        const mockFileFetcher = jest.fn().mockResolvedValue(Buffer.from("%PDF-1.4"));
        const mockDocExtractor = { extractDocument: jest.fn() };
        const mockParserService = {
            parseResumeDocument: jest.fn().mockResolvedValue({
                personal: { fullName: "Jane Doe", email: "jane@talentforge.ai" },
                professional: { headline: "AI Engineer" },
                skills: [{ name: "Python" }, { name: "PyTorch" }],
                experience: [],
                education: [],
                projects: [],
                certifications: []
            }),
            parseResumeText: jest.fn()
        };
        const mockNormalizationService = {
            normalizeResumeData: jest.fn().mockImplementation(async (data) => data)
        };
        const mockPersistenceService = {
            persistResumeData: jest.fn().mockResolvedValue({
                candidateId: mockCandidateA.id,
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
        const pipeline = new ResumeProcessingPipeline(mockDocExtractor, mockParserService, mockNormalizationService, mockPersistenceService, mockFileFetcher);
        const worker = new ResumeProcessingWorker(pipeline);
        const client = ioc(`${serverAddress}${RESUME_SOCKET_NAMESPACE}`, {
            auth: { token: tokenCandidateA },
            transports: ["websocket"]
        });
        await new Promise((res) => client.on("connect", () => res()));
        client.emit(RESUME_SOCKET_EVENTS.SUBSCRIBE, { resumeId });
        await new Promise((resolve) => setTimeout(resolve, 50));
        const stageEvents = [];
        client.on(RESUME_SOCKET_EVENTS.STAGE_CHANGE, (payload) => {
            stageEvents.push(payload);
        });
        const completedPromise = new Promise((resolve) => {
            client.on(RESUME_SOCKET_EVENTS.COMPLETED, resolve);
        });
        const jobResult = await worker.processJob({
            id: jobId,
            data: {
                candidateId: mockCandidateA.id,
                resumeId,
                fileReference: resumeDbRecord.fileUrl,
                mimeType: resumeDbRecord.mimeType
            },
            attemptsMade: 0,
            opts: { attempts: 3 }
        });
        expect(jobResult.success).toBe(true);
        expect(mockDocExtractor.extractDocument).not.toHaveBeenCalled();
        await completedPromise;
        expect(stageEvents.map((e) => e.stage)).toEqual([
            "FETCHING_FILE",
            "AI_PARSING",
            "NORMALIZATION",
            "PERSISTENCE"
        ]);
        expect(stageEvents[1]?.mode).toBe("DIRECT");
        client.disconnect();
    });
    // =========================================================================
    // Scenario C: PDF Direct AI Parsing Failure -> Local Fallback Extraction
    // =========================================================================
    test("Scenario C: PDF direct AI parsing failure -> local extraction fallback -> successful parsing with mode: FALLBACK", async () => {
        const resumeId = "resume-pdf-fallback-1";
        const jobId = "job-pdf-fallback-101";
        const resumeDbRecord = {
            id: resumeId,
            candidateId: mockCandidateA.id,
            fileUrl: "https://storage.talentforge.ai/resumes/complex.pdf",
            mimeType: "application/pdf",
            parsingStatus: "QUEUED",
            parsingStartedAt: null,
            parsingCompletedAt: null,
            parsingError: null
        };
        jest.spyOn(prisma.resume, "findUnique").mockImplementation(async (args) => {
            if (args.where.id === resumeId)
                return resumeDbRecord;
            return null;
        });
        jest.spyOn(prisma.candidate, "findUnique").mockImplementation(async (args) => {
            if (args.where.userId === mockCandidateA.id)
                return { id: mockCandidateA.id };
            return null;
        });
        jest.spyOn(prisma.resume, "update").mockImplementation(async (args) => {
            if (args.where.id === resumeId) {
                Object.assign(resumeDbRecord, args.data);
                return resumeDbRecord;
            }
            return null;
        });
        const mockFileFetcher = jest.fn().mockResolvedValue(Buffer.from("%PDF-1.4"));
        const mockDocExtractor = {
            extractDocument: jest.fn().mockResolvedValue({
                text: "Fallback Extracted Content Jane Doe",
                pageCount: 1,
                wordCount: 5
            })
        };
        const mockParserService = {
            parseResumeDocument: jest.fn().mockRejectedValue(new Error("Direct PDF document parsing failed")),
            parseResumeText: jest.fn().mockResolvedValue({
                personal: { fullName: "Jane Doe", email: "jane@talentforge.ai" },
                professional: { headline: "Backend Engineer" },
                skills: [{ name: "Node.js" }],
                experience: [],
                education: [],
                projects: [],
                certifications: []
            })
        };
        const mockNormalizationService = {
            normalizeResumeData: jest.fn().mockImplementation(async (data) => data)
        };
        const mockPersistenceService = {
            persistResumeData: jest.fn().mockResolvedValue({
                candidateId: mockCandidateA.id,
                skillsCreated: 1,
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
        const pipeline = new ResumeProcessingPipeline(mockDocExtractor, mockParserService, mockNormalizationService, mockPersistenceService, mockFileFetcher);
        const worker = new ResumeProcessingWorker(pipeline);
        const client = ioc(`${serverAddress}${RESUME_SOCKET_NAMESPACE}`, {
            auth: { token: tokenCandidateA },
            transports: ["websocket"]
        });
        await new Promise((res) => client.on("connect", () => res()));
        client.emit(RESUME_SOCKET_EVENTS.SUBSCRIBE, { resumeId });
        await new Promise((resolve) => setTimeout(resolve, 50));
        const stageEvents = [];
        client.on(RESUME_SOCKET_EVENTS.STAGE_CHANGE, (payload) => {
            stageEvents.push(payload);
        });
        const completedPromise = new Promise((resolve) => {
            client.on(RESUME_SOCKET_EVENTS.COMPLETED, resolve);
        });
        const jobResult = await worker.processJob({
            id: jobId,
            data: {
                candidateId: mockCandidateA.id,
                resumeId,
                fileReference: resumeDbRecord.fileUrl,
                mimeType: resumeDbRecord.mimeType
            },
            attemptsMade: 0,
            opts: { attempts: 3 }
        });
        expect(jobResult.success).toBe(true);
        expect(mockDocExtractor.extractDocument).toHaveBeenCalledTimes(1);
        expect(mockParserService.parseResumeText).toHaveBeenCalledWith("Fallback Extracted Content Jane Doe");
        await completedPromise;
        expect(stageEvents.map((e) => e.stage)).toEqual([
            "FETCHING_FILE",
            "AI_PARSING",
            "EXTRACTION",
            "AI_PARSING",
            "NORMALIZATION",
            "PERSISTENCE"
        ]);
        expect(stageEvents[1]?.mode).toBe("DIRECT");
        expect(stageEvents[2]?.mode).toBe("FALLBACK");
        expect(stageEvents[3]?.mode).toBe("FALLBACK");
        client.disconnect();
    });
    // =========================================================================
    // Scenario D: Permanent AI Failure (e.g. 401 Unauthorized API Key)
    // =========================================================================
    test("Scenario D: Permanent AI failure -> immediately marks FAILED in DB and emits Socket.IO FAILED event without retrying", async () => {
        const resumeId = "resume-perm-fail-1";
        const jobId = "job-perm-fail-101";
        const resumeDbRecord = {
            id: resumeId,
            candidateId: mockCandidateA.id,
            fileUrl: "https://storage.talentforge.ai/resumes/bad-auth.pdf",
            mimeType: "application/pdf",
            parsingStatus: "QUEUED",
            parsingStartedAt: null,
            parsingCompletedAt: null,
            parsingError: null
        };
        jest.spyOn(prisma.resume, "findUnique").mockImplementation(async (args) => {
            if (args.where.id === resumeId)
                return resumeDbRecord;
            return null;
        });
        jest.spyOn(prisma.candidate, "findUnique").mockImplementation(async (args) => {
            if (args.where.userId === mockCandidateA.id)
                return { id: mockCandidateA.id };
            return null;
        });
        jest.spyOn(prisma.resume, "update").mockImplementation(async (args) => {
            if (args.where.id === resumeId) {
                Object.assign(resumeDbRecord, args.data);
                return resumeDbRecord;
            }
            return null;
        });
        const mockFileFetcher = jest.fn().mockResolvedValue(Buffer.from("%PDF-1.4"));
        const mockDocExtractor = { extractDocument: jest.fn() };
        const mockParserService = {
            parseResumeDocument: jest.fn().mockRejectedValue(new OpenRouterError("Unauthorized: invalid API key", 401)),
            parseResumeText: jest.fn()
        };
        const pipeline = new ResumeProcessingPipeline(mockDocExtractor, mockParserService, {}, {}, mockFileFetcher);
        const worker = new ResumeProcessingWorker(pipeline);
        const client = ioc(`${serverAddress}${RESUME_SOCKET_NAMESPACE}`, {
            auth: { token: tokenCandidateA },
            transports: ["websocket"]
        });
        await new Promise((res) => client.on("connect", () => res()));
        client.emit(RESUME_SOCKET_EVENTS.SUBSCRIBE, { resumeId });
        await new Promise((resolve) => setTimeout(resolve, 50));
        const failedPromise = new Promise((resolve) => {
            client.on(RESUME_SOCKET_EVENTS.FAILED, resolve);
        });
        await expect(worker.processJob({
            id: jobId,
            data: {
                candidateId: mockCandidateA.id,
                resumeId,
                fileReference: resumeDbRecord.fileUrl,
                mimeType: resumeDbRecord.mimeType
            },
            attemptsMade: 0,
            opts: { attempts: 3 }
        })).rejects.toThrow();
        const failedEvent = await failedPromise;
        expect(failedEvent.stage).toBe("FAILED");
        expect(failedEvent.resumeId).toBe(resumeId);
        expect(resumeDbRecord.parsingStatus).toBe("FAILED");
        expect(resumeDbRecord.parsingError).toBe("Unauthorized: invalid API key");
        client.disconnect();
    });
    // =========================================================================
    // Scenario E: Transient AI Failure -> BullMQ Retry
    // =========================================================================
    test("Scenario E: Transient AI failure -> rethrows for BullMQ retry on attempt 1, does NOT emit FAILED event yet", async () => {
        const resumeId = "resume-transient-1";
        const jobId = "job-transient-101";
        const resumeDbRecord = {
            id: resumeId,
            candidateId: mockCandidateA.id,
            fileUrl: "https://storage.talentforge.ai/resumes/timeout.pdf",
            mimeType: "application/pdf",
            parsingStatus: "QUEUED",
            parsingStartedAt: null,
            parsingCompletedAt: null,
            parsingError: null
        };
        jest.spyOn(prisma.resume, "findUnique").mockImplementation(async (args) => {
            if (args.where.id === resumeId)
                return resumeDbRecord;
            return null;
        });
        jest.spyOn(prisma.candidate, "findUnique").mockImplementation(async (args) => {
            if (args.where.userId === mockCandidateA.id)
                return { id: mockCandidateA.id };
            return null;
        });
        jest.spyOn(prisma.resume, "update").mockImplementation(async (args) => {
            if (args.where.id === resumeId) {
                Object.assign(resumeDbRecord, args.data);
                return resumeDbRecord;
            }
            return null;
        });
        const mockFileFetcher = jest.fn().mockResolvedValue(Buffer.from("%PDF-1.4"));
        const mockDocExtractor = {
            extractDocument: jest.fn().mockResolvedValue({ text: "Sample text", wordCount: 2 })
        };
        const mockParserService = {
            parseResumeDocument: jest.fn().mockRejectedValue(new Error("Direct failed")),
            parseResumeText: jest.fn().mockRejectedValue(new Error("Network connection reset by peer"))
        };
        const pipeline = new ResumeProcessingPipeline(mockDocExtractor, mockParserService, {}, {}, mockFileFetcher);
        const worker = new ResumeProcessingWorker(pipeline);
        const publishFinalFailureSpy = jest.spyOn(ResumeProgressPublisher, "publishFinalFailure");
        // Attempt 1 of 3 (transient failure)
        await expect(worker.processJob({
            id: jobId,
            data: {
                candidateId: mockCandidateA.id,
                resumeId,
                fileReference: resumeDbRecord.fileUrl,
                mimeType: resumeDbRecord.mimeType
            },
            attemptsMade: 0,
            opts: { attempts: 3 }
        })).rejects.toThrow("Network connection reset by peer");
        // Status in DB remains PROCESSING (waiting for retry)
        expect(resumeDbRecord.parsingStatus).toBe("PROCESSING");
        expect(publishFinalFailureSpy).not.toHaveBeenCalled();
    });
    // =========================================================================
    // Scenario F: Invalid / Unsupported Document
    // =========================================================================
    test("Scenario F: Invalid / unsupported document -> Permanent failure classification", async () => {
        const resumeId = "resume-unsupported-1";
        const jobId = "job-unsupported-101";
        const resumeDbRecord = {
            id: resumeId,
            candidateId: mockCandidateA.id,
            fileUrl: "https://storage.talentforge.ai/resumes/file.exe",
            mimeType: "application/x-msdownload",
            parsingStatus: "QUEUED",
            parsingStartedAt: null,
            parsingCompletedAt: null,
            parsingError: null
        };
        jest.spyOn(prisma.resume, "findUnique").mockImplementation(async (args) => {
            if (args.where.id === resumeId)
                return resumeDbRecord;
            return null;
        });
        jest.spyOn(prisma.candidate, "findUnique").mockImplementation(async (args) => {
            if (args.where.userId === mockCandidateA.id)
                return { id: mockCandidateA.id };
            return null;
        });
        jest.spyOn(prisma.resume, "update").mockImplementation(async (args) => {
            if (args.where.id === resumeId) {
                Object.assign(resumeDbRecord, args.data);
                return resumeDbRecord;
            }
            return null;
        });
        const mockFileFetcher = jest.fn().mockResolvedValue(Buffer.from("invalid-binary"));
        const mockDocExtractor = {
            extractDocument: jest.fn().mockRejectedValue(new UnsupportedFileTypeError("application/x-msdownload"))
        };
        const mockParserService = {
            parseResumeDocument: jest.fn().mockRejectedValue(new UnsupportedFileTypeError("application/x-msdownload")),
            parseResumeText: jest.fn()
        };
        const pipeline = new ResumeProcessingPipeline(mockDocExtractor, mockParserService, {}, {}, mockFileFetcher);
        const worker = new ResumeProcessingWorker(pipeline);
        await expect(worker.processJob({
            id: jobId,
            data: {
                candidateId: mockCandidateA.id,
                resumeId,
                fileReference: resumeDbRecord.fileUrl,
                mimeType: resumeDbRecord.mimeType
            },
            attemptsMade: 0,
            opts: { attempts: 3 }
        })).rejects.toThrow();
        expect(resumeDbRecord.parsingStatus).toBe("FAILED");
    });
    // =========================================================================
    // Scenario G: Persistence / Database Failure Protection
    // =========================================================================
    test("Scenario G: Persistence / database failure -> Socket COMPLETED is NOT emitted and error propagates to BullMQ", async () => {
        const resumeId = "resume-persist-fail-1";
        const jobId = "job-persist-fail-101";
        const resumeDbRecord = {
            id: resumeId,
            candidateId: mockCandidateA.id,
            fileUrl: "https://storage.talentforge.ai/resumes/john.pdf",
            mimeType: "application/pdf",
            parsingStatus: "QUEUED",
            parsingStartedAt: null,
            parsingCompletedAt: null,
            parsingError: null
        };
        jest.spyOn(prisma.resume, "findUnique").mockImplementation(async (args) => {
            if (args.where.id === resumeId)
                return resumeDbRecord;
            return null;
        });
        jest.spyOn(prisma.candidate, "findUnique").mockImplementation(async (args) => {
            if (args.where.userId === mockCandidateA.id)
                return { id: mockCandidateA.id };
            return null;
        });
        jest.spyOn(prisma.resume, "update").mockImplementation(async (args) => {
            if (args.where.id === resumeId) {
                Object.assign(resumeDbRecord, args.data);
                return resumeDbRecord;
            }
            return null;
        });
        const mockFileFetcher = jest.fn().mockResolvedValue(Buffer.from("%PDF-1.4"));
        const mockDocExtractor = { extractDocument: jest.fn() };
        const mockParserService = {
            parseResumeDocument: jest.fn().mockResolvedValue({
                personal: { fullName: "John Doe" },
                professional: {},
                skills: [],
                experience: [],
                education: [],
                projects: [],
                certifications: []
            }),
            parseResumeText: jest.fn()
        };
        const mockNormalizationService = {
            normalizeResumeData: jest.fn().mockImplementation(async (data) => data)
        };
        const mockPersistenceService = {
            persistResumeData: jest.fn().mockRejectedValue(new Error("Database transaction rolled back"))
        };
        const pipeline = new ResumeProcessingPipeline(mockDocExtractor, mockParserService, mockNormalizationService, mockPersistenceService, mockFileFetcher);
        const worker = new ResumeProcessingWorker(pipeline);
        const publishCompletedSpy = jest.spyOn(ResumeProgressPublisher, "publishCompleted");
        await expect(worker.processJob({
            id: jobId,
            data: {
                candidateId: mockCandidateA.id,
                resumeId,
                fileReference: resumeDbRecord.fileUrl,
                mimeType: resumeDbRecord.mimeType
            },
            attemptsMade: 0,
            opts: { attempts: 3 }
        })).rejects.toThrow("Database transaction rolled back");
        expect(publishCompletedSpy).not.toHaveBeenCalled();
    });
    // =========================================================================
    // Scenario H: Duplicate / Repeated Processing (Idempotency)
    // =========================================================================
    test("Scenario H: Duplicate / repeated processing -> skips pipeline execution if already COMPLETED", async () => {
        const resumeId = "resume-already-completed-1";
        const jobId = "job-duplicate-101";
        const resumeDbRecord = {
            id: resumeId,
            candidateId: mockCandidateA.id,
            fileUrl: "https://storage.talentforge.ai/resumes/john.pdf",
            mimeType: "application/pdf",
            parsingStatus: "COMPLETED",
            parsingStartedAt: new Date(),
            parsingCompletedAt: new Date(),
            parsingError: null
        };
        jest.spyOn(prisma.resume, "findUnique").mockImplementation(async (args) => {
            if (args.where.id === resumeId)
                return resumeDbRecord;
            return null;
        });
        const mockExecute = jest.fn();
        const pipeline = { execute: mockExecute };
        const worker = new ResumeProcessingWorker(pipeline);
        const result = await worker.processJob({
            id: jobId,
            data: {
                candidateId: mockCandidateA.id,
                resumeId,
                fileReference: resumeDbRecord.fileUrl,
                mimeType: resumeDbRecord.mimeType
            },
            attemptsMade: 0,
            opts: { attempts: 3 }
        });
        expect(result.success).toBe(true);
        expect(mockExecute).not.toHaveBeenCalled();
    });
    // =========================================================================
    // Scenario I: Socket.IO Progress Delivery & Stage Metadata
    // =========================================================================
    test("Scenario I: Socket.IO progress delivery verifies structured stage change events and timing", async () => {
        const resumeId = "resume-progress-timing-1";
        jest.spyOn(prisma.resume, "findUnique").mockResolvedValue({
            id: resumeId,
            candidateId: mockCandidateA.id,
            parsingStatus: "QUEUED",
            parsingStartedAt: null,
            parsingCompletedAt: null
        });
        jest.spyOn(prisma.candidate, "findUnique").mockResolvedValue({ id: mockCandidateA.id });
        const client = ioc(`${serverAddress}${RESUME_SOCKET_NAMESPACE}`, {
            auth: { token: tokenCandidateA },
            transports: ["websocket"]
        });
        await new Promise((res) => client.on("connect", () => res()));
        client.emit(RESUME_SOCKET_EVENTS.SUBSCRIBE, { resumeId });
        await new Promise((resolve) => setTimeout(resolve, 50));
        const stagePayloads = [];
        client.on(RESUME_SOCKET_EVENTS.STAGE_CHANGE, (payload) => stagePayloads.push(payload));
        await ResumeProgressPublisher.publishStageChange("FETCHING_FILE", {
            jobId: "job-timing-1",
            resumeId,
            candidateId: mockCandidateA.id
        });
        await ResumeProgressPublisher.publishStageChange("AI_PARSING", {
            jobId: "job-timing-1",
            resumeId,
            candidateId: mockCandidateA.id,
            mode: "DIRECT"
        });
        await new Promise((resolve) => setTimeout(resolve, 50));
        expect(stagePayloads.length).toBe(2);
        expect(stagePayloads[0]?.stage).toBe("FETCHING_FILE");
        expect(stagePayloads[0]?.message).toBe("Fetching resume document");
        expect(stagePayloads[1]?.stage).toBe("AI_PARSING");
        expect(stagePayloads[1]?.mode).toBe("DIRECT");
        client.disconnect();
    });
    // =========================================================================
    // Scenario J: Unauthorized Resume Socket.IO Subscription
    // =========================================================================
    test("Scenario J: Unauthorized resume Socket.IO subscription -> rejects Candidate B from Candidate A's resume room", async () => {
        const resumeIdA = "resume-candidate-a-secure-1";
        jest.spyOn(prisma.resume, "findUnique").mockResolvedValue({
            id: resumeIdA,
            candidateId: mockCandidateA.id,
            parsingStatus: "QUEUED",
            parsingStartedAt: null,
            parsingCompletedAt: null
        });
        jest.spyOn(prisma.candidate, "findUnique").mockImplementation(async (args) => {
            if (args.where.userId === mockCandidateB.id)
                return { id: mockCandidateB.id };
            return null;
        });
        // Client B tries to subscribe to Resume A
        const clientB = ioc(`${serverAddress}${RESUME_SOCKET_NAMESPACE}`, {
            auth: { token: tokenCandidateB },
            transports: ["websocket"]
        });
        await new Promise((res) => clientB.on("connect", () => res()));
        const errorPromise = new Promise((resolve) => {
            clientB.on(RESUME_SOCKET_EVENTS.ERROR, resolve);
        });
        clientB.emit(RESUME_SOCKET_EVENTS.SUBSCRIBE, { resumeId: resumeIdA });
        const error = await errorPromise;
        expect(error.code).toBe("UNAUTHORIZED");
        expect(error.message).toMatch(/not authorized/i);
        clientB.disconnect();
    });
});
//# sourceMappingURL=resume-orchestration.e2e.test.js.map