import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import { createServer, Server as HttpServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { io as ioc, Socket as ClientSocket } from "socket.io-client";
import prisma from "../../../config/database.js";
import { JwtHelper } from "../../../common/helper/jwt.helper.js";
import { initializeInterviewSocket } from "../websocket/interview.socket.js";
import { UserRole, InterviewType, InterviewMode, InterviewSessionStatus } from "@prisma/client";

describe("NORMAL Live 1-to-1 Interview Phase 2 Socket.IO Suite", () => {
    let httpServer: HttpServer;
    let ioServer: SocketIOServer;
    let serverAddress: string;

    let company: any;
    let recruiterUser: any;
    let recruiterToken: string;
    let candidateUser: any;
    let candidateToken: string;
    let unauthorizedUser: any;
    let unauthorizedToken: string;
    let session: any;

    beforeAll(async () => {
        const timestamp = Date.now();

        // 1. Create Company
        company = await prisma.company.create({
            data: {
                companyName: `Phase2 Tech Corp ${timestamp}`,
                slug: `phase2-tech-corp-${timestamp}`,
                status: "ACTIVE"
            }
        });

        // 2. Create Recruiter User & Member
        recruiterUser = await prisma.user.create({
            data: {
                email: `recruiter_phase2_${timestamp}@example.com`,
                password: "Password@123",
                role: UserRole.EMPLOYER,
                status: "ACTIVE"
            }
        });
        recruiterToken = JwtHelper.generateAccessToken({
            id: recruiterUser.id,
            email: recruiterUser.email,
            role: recruiterUser.role
        });

        const recruiterMember = await prisma.companyMember.create({
            data: {
                userId: recruiterUser.id,
                companyId: company.id,
                role: "RECRUITER",
                status: "ACTIVE"
            }
        });

        // 3. Create Candidate User & Application
        candidateUser = await prisma.user.create({
            data: {
                email: `candidate_phase2_${timestamp}@example.com`,
                password: "Password@123",
                role: UserRole.CANDIDATE,
                status: "ACTIVE"
            }
        });
        candidateToken = JwtHelper.generateAccessToken({
            id: candidateUser.id,
            email: candidateUser.email,
            role: candidateUser.role
        });

        const candidate = await prisma.candidate.create({
            data: {
                userId: candidateUser.id,
                fullName: "Jane Phase2"
            }
        });

        const job = await prisma.job.create({
            data: {
                companyId: company.id,
                title: `Senior Fullstack Engineer ${timestamp}`,
                slug: `senior-fullstack-engineer-${timestamp}`,
                description: "React & Node live interview",
                employmentType: "FULL_TIME",
                workplaceType: "REMOTE",
                createdById: recruiterUser.id
            }
        });

        const application = await prisma.application.create({
            data: {
                candidateId: candidate.id,
                jobId: job.id,
                status: "APPLIED"
            }
        });

        // 4. Unauthorized User
        unauthorizedUser = await prisma.user.create({
            data: {
                email: `unauth_phase2_${timestamp}@example.com`,
                password: "Password@123",
                role: UserRole.CANDIDATE,
                status: "ACTIVE"
            }
        });
        unauthorizedToken = JwtHelper.generateAccessToken({
            id: unauthorizedUser.id,
            email: unauthorizedUser.email,
            role: unauthorizedUser.role
        });

        // 5. Create Normal Interview & Session
        const interview = await prisma.interview.create({
            data: {
                companyId: company.id,
                createdById: recruiterMember.id,
                title: "Live 1-to-1 Technical Session",
                type: InterviewType.NORMAL,
                mode: InterviewMode.INDIVIDUAL,
                durationMinutes: 60,
                status: "ACTIVE"
            }
        });

        const assignment = await prisma.interviewAssignment.create({
            data: {
                interviewId: interview.id,
                applicationId: application.id,
                creationSource: "MANUAL",
                assignedById: recruiterMember.id
            }
        });

        session = await prisma.interviewSession.create({
            data: {
                interviewId: interview.id,
                scheduledAt: new Date(Date.now() + 3600000),
                status: InterviewSessionStatus.SCHEDULED,
                participants: {
                    create: [
                        {
                            participantType: "CANDIDATE",
                            assignmentId: assignment.id
                        },
                        {
                            participantType: "INTERVIEWER",
                            companyMemberId: recruiterMember.id
                        }
                    ]
                }
            }
        });

        // 6. Start Http & Socket.IO server
        httpServer = createServer();
        ioServer = new SocketIOServer(httpServer, { cors: { origin: "*" } });
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
        if (ioServer) {
            await ioServer.close();
        }
        if (httpServer) {
            httpServer.close();
        }
    });

    const connectSocket = (token: string): Promise<ClientSocket> => {
        return new Promise((resolve, reject) => {
            const socket = ioc(`${serverAddress}/interviews`, {
                auth: { token },
                transports: ["websocket"]
            });
            socket.on("connect", () => resolve(socket));
            socket.on("connect_error", (err) => reject(err));
        });
    };

    const joinSessionRoom = (socket: ClientSocket, sessionId: string): Promise<any> => {
        return new Promise((resolve) => {
            socket.once("room-users", (data) => resolve(data));
            socket.emit("join-room", { sessionId });
        });
    };

    test("1. Candidate and Recruiter join room successfully", async () => {
        const recruiterSocket = await connectSocket(recruiterToken);
        const candidateSocket = await connectSocket(candidateToken);

        const userJoinedPromise = new Promise<any>((resolve) => {
            recruiterSocket.on("user-joined", (data) => resolve(data));
        });

        await joinSessionRoom(recruiterSocket, session.id);
        await joinSessionRoom(candidateSocket, session.id);

        const userJoined = await userJoinedPromise;
        expect(userJoined.userId).toBe(candidateUser.id);

        recruiterSocket.disconnect();
        candidateSocket.disconnect();
    });

    test("2. Authorized Recruiter starts interview -> triggers interview-started", async () => {
        const recruiterSocket = await connectSocket(recruiterToken);
        const candidateSocket = await connectSocket(candidateToken);

        await joinSessionRoom(recruiterSocket, session.id);
        await joinSessionRoom(candidateSocket, session.id);

        const startedPromise = new Promise<any>((resolve) => {
            candidateSocket.on("interview-started", (data) => resolve(data));
        });

        recruiterSocket.emit("start-interview", { sessionId: session.id });

        const startedData = await startedPromise;
        expect(startedData.sessionId).toBe(session.id);
        expect(startedData.status).toBe("IN_PROGRESS");

        recruiterSocket.disconnect();
        candidateSocket.disconnect();
    });

    test("3. Candidate attempting to start interview fails with error", async () => {
        const candidateSocket = await connectSocket(candidateToken);
        await joinSessionRoom(candidateSocket, session.id);

        const errorPromise = new Promise<any>((resolve) => {
            candidateSocket.on("error", (err) => resolve(err));
        });

        candidateSocket.emit("start-interview", { sessionId: session.id });

        const err = await errorPromise;
        expect(err.message).toBeDefined();

        candidateSocket.disconnect();
    });

    test("4. Collaborative code-change and language-change synchronization", async () => {
        const recruiterSocket = await connectSocket(recruiterToken);
        const candidateSocket = await connectSocket(candidateToken);

        await joinSessionRoom(recruiterSocket, session.id);
        await joinSessionRoom(candidateSocket, session.id);

        const codeChangePromise = new Promise<any>((resolve) => {
            candidateSocket.on("code-change", (data) => resolve(data));
        });

        recruiterSocket.emit("code-change", {
            sessionId: session.id,
            code: "function solution() { return 42; }"
        });

        const codeData = await codeChangePromise;
        expect(codeData.code).toBe("function solution() { return 42; }");

        const langChangePromise = new Promise<any>((resolve) => {
            recruiterSocket.on("language-change", (data) => resolve(data));
        });

        candidateSocket.emit("language-change", {
            sessionId: session.id,
            language: "typescript"
        });

        const langData = await langChangePromise;
        expect(langData.language).toBe("typescript");

        recruiterSocket.disconnect();
        candidateSocket.disconnect();
    });

    test("5. Code sync on reconnect retrieves stored editor state", async () => {
        const recruiterSocket = await connectSocket(recruiterToken);

        const syncData = await joinSessionRoom(recruiterSocket, session.id);

        const syncPromise = new Promise<any>((resolve) => {
            recruiterSocket.on("code-sync", (data) => resolve(data));
        });

        recruiterSocket.emit("code-sync", { sessionId: session.id });

        const syncState = await syncPromise;
        expect(syncState.code).toBe("function solution() { return 42; }");
        expect(syncState.language).toBe("typescript");

        recruiterSocket.disconnect();
    });

    test("6. Unauthorized socket cannot emit code-change", async () => {
        const unauthSocket = await connectSocket(unauthorizedToken);

        const errorPromise = new Promise<any>((resolve) => {
            unauthSocket.on("error", (err) => resolve(err));
        });

        unauthSocket.emit("code-change", {
            sessionId: session.id,
            code: "malicious code"
        });

        const err = await errorPromise;
        expect(err.message).toContain("Forbidden");

        unauthSocket.disconnect();
    });

    test("7. Authorized Recruiter ends interview -> triggers interview-ended", async () => {
        const recruiterSocket = await connectSocket(recruiterToken);
        const candidateSocket = await connectSocket(candidateToken);

        await joinSessionRoom(recruiterSocket, session.id);
        await joinSessionRoom(candidateSocket, session.id);

        const endedPromise = new Promise<any>((resolve) => {
            candidateSocket.on("interview-ended", (data) => resolve(data));
        });

        recruiterSocket.emit("end-interview", { sessionId: session.id });

        const endedData = await endedPromise;
        expect(endedData.sessionId).toBe(session.id);
        expect(endedData.status).toBe("COMPLETED");

        recruiterSocket.disconnect();
        candidateSocket.disconnect();
    });
});
