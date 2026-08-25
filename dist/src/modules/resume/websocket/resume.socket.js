import { logger } from "../../../common/logger/logger.js";
import { socketAuthMiddleware } from "../../interviews/websocket/interview.socket.auth.js";
import { RESUME_SOCKET_NAMESPACE } from "./resume-socket.constants.js";
import { ResumeProgressPublisher } from "./resume-progress.publisher.js";
import { registerResumeSocketHandlers } from "./resume.socket.handler.js";
/**
 * Initializes the dedicated `/resume-processing` Socket.IO namespace.
 */
export function initializeResumeSocket(io) {
    const resumeNamespace = io.of(RESUME_SOCKET_NAMESPACE);
    // Apply shared JWT socket authentication middleware
    resumeNamespace.use(socketAuthMiddleware);
    // Register namespace with the progress publisher for live broadcasts
    ResumeProgressPublisher.setNamespace(resumeNamespace);
    resumeNamespace.on("connection", (socket) => {
        const user = socket.data?.user || socket.user;
        logger.info({
            event: "SOCKET_CONNECTED",
            socketId: socket.id,
            userId: user?.id,
            email: user?.email
        }, `[ResumeSocket] Client connected to ${RESUME_SOCKET_NAMESPACE} : ${socket.id}`);
        registerResumeSocketHandlers(socket);
    });
    logger.info(`[ResumeSocket] Initialized ${RESUME_SOCKET_NAMESPACE} namespace successfully.`);
}
//# sourceMappingURL=resume.socket.js.map