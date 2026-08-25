import { logger } from "../../../common/logger/logger.js";
import prisma from "../../../config/database.js";
import { getResumeRoomName, RESUME_SOCKET_EVENTS } from "./resume-socket.constants.js";
// Registers client event listeners for the authenticated resume socket.
export function registerResumeSocketHandlers(socket) {
    const user = socket.data?.user || socket.user;
    if (!user || !user.id) {
        logger.warn({ socketId: socket.id }, "[ResumeSocketHandler] Socket connected without user context. Disconnecting...");
        socket.disconnect(true);
        return;
    }
    const candidateId = user.id;
    logger.info({
        event: "SOCKET_AUTHENTICATED",
        socketId: socket.id,
        candidateId
    }, `[ResumeSocketHandler] Candidate "${candidateId}" authenticated on socket "${socket.id}"`);
    // Client requests subscription to a resume
    socket.on(RESUME_SOCKET_EVENTS.SUBSCRIBE, async (data) => {
        try {
            if (!data || !data.resumeId || typeof data.resumeId !== "string") {
                const errorPayload = {
                    code: "INVALID_PAYLOAD",
                    message: "Invalid subscription payload. resumeId is required.",
                    timestamp: new Date().toISOString()
                };
                socket.emit(RESUME_SOCKET_EVENTS.ERROR, errorPayload);
                return;
            }
            const { resumeId } = data;
            // Resolve candidate record from authenticated userId if needed
            let candidateRecord = await prisma.candidate.findUnique({
                where: { userId: candidateId },
                select: { id: true }
            });
            const effectiveCandidateId = candidateRecord ? candidateRecord.id : candidateId;
            // Strict Authorization: Verify candidate owns this resume in PostgreSQL
            const resume = await prisma.resume.findUnique({
                where: { id: resumeId },
                select: {
                    id: true,
                    candidateId: true,
                    parsingStatus: true,
                    parsingStartedAt: true,
                    parsingCompletedAt: true
                }
            });
            if (!resume) {
                logger.warn({
                    event: "RESUME_SUBSCRIPTION_REJECTED",
                    socketId: socket.id,
                    candidateId,
                    effectiveCandidateId,
                    resumeId,
                    reason: "NOT_FOUND"
                }, `[ResumeSocketHandler] Candidate "${candidateId}" requested non-existent resume "${resumeId}"`);
                const errorPayload = {
                    code: "NOT_FOUND",
                    message: `Resume with ID "${resumeId}" was not found`,
                    resumeId,
                    timestamp: new Date().toISOString()
                };
                socket.emit(RESUME_SOCKET_EVENTS.ERROR, errorPayload);
                return;
            }
            if (resume.candidateId !== effectiveCandidateId && resume.candidateId !== candidateId) {
                logger.warn({
                    event: "RESUME_SUBSCRIPTION_REJECTED",
                    socketId: socket.id,
                    candidateId,
                    effectiveCandidateId,
                    resumeId,
                    actualCandidateId: resume.candidateId,
                    reason: "UNAUTHORIZED"
                }, `[ResumeSocketHandler] Unauthorized subscription attempt: User "${candidateId}" (Candidate: "${effectiveCandidateId}") tried to subscribe to resume "${resumeId}" owned by "${resume.candidateId}"`);
                const errorPayload = {
                    code: "UNAUTHORIZED",
                    message: "You are not authorized to subscribe to this resume",
                    resumeId,
                    timestamp: new Date().toISOString()
                };
                socket.emit(RESUME_SOCKET_EVENTS.ERROR, errorPayload);
                return;
            }
            // Join room
            const roomName = getResumeRoomName(resumeId);
            await socket.join(roomName);
            logger.info({
                event: "RESUME_SUBSCRIBED",
                socketId: socket.id,
                candidateId,
                effectiveCandidateId,
                resumeId,
                roomName,
                parsingStatus: resume.parsingStatus
            }, `[ResumeSocketHandler] Candidate "${candidateId}" subscribed to room "${roomName}"`);
            // Acknowledge subscription to client with current state recovery for late subscribers
            const subscribedPayload = {
                resumeId,
                status: resume.parsingStatus,
                currentStage: resume.parsingStatus === "COMPLETED"
                    ? "COMPLETED"
                    : resume.parsingStatus === "FAILED"
                        ? "FAILED"
                        : resume.parsingStatus === "PROCESSING"
                            ? "AI_PARSING"
                            : "QUEUED",
                roomName,
                parsingStartedAt: resume.parsingStartedAt?.toISOString(),
                parsingCompletedAt: resume.parsingCompletedAt?.toISOString(),
                timestamp: new Date().toISOString()
            };
            socket.emit(RESUME_SOCKET_EVENTS.SUBSCRIBED, subscribedPayload);
        }
        catch (error) {
            logger.error({
                err: error,
                socketId: socket.id,
                candidateId
            }, "[ResumeSocketHandler] Error handling resume subscription");
            const errorPayload = {
                code: "INTERNAL_ERROR",
                message: "An internal error occurred while subscribing to resume progress",
                timestamp: new Date().toISOString()
            };
            socket.emit(RESUME_SOCKET_EVENTS.ERROR, errorPayload);
        }
    });
    // Client requests unsubscription from a resume
    socket.on(RESUME_SOCKET_EVENTS.UNSUBSCRIBE, async (data) => {
        try {
            if (data?.resumeId && typeof data.resumeId === "string") {
                const roomName = getResumeRoomName(data.resumeId);
                await socket.leave(roomName);
                logger.info({
                    socketId: socket.id,
                    candidateId,
                    resumeId: data.resumeId,
                    roomName
                }, `[ResumeSocketHandler] Candidate "${candidateId}" unsubscribed from room "${roomName}"`);
            }
        }
        catch (error) {
            logger.warn({ err: error, socketId: socket.id }, "[ResumeSocketHandler] Error handling resume unsubscribe");
        }
    });
    socket.on("disconnect", (reason) => {
        logger.info({
            event: "SOCKET_DISCONNECTED",
            socketId: socket.id,
            candidateId,
            reason
        }, `[ResumeSocketHandler] Socket disconnected for candidate "${candidateId}": ${reason}`);
    });
}
//# sourceMappingURL=resume.socket.handler.js.map