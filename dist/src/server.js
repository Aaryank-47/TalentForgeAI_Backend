import app from './app.js';
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDatabase } from './config/database.js';
import env from './config/env.js';
import { ElasticsearchService } from './modules/company/services/elasticsearch.service.js';
import { MatchingElasticsearchService } from './modules/matching/services/matching-elasticsearch.service.js';
import { initializeInterviewSocket } from './modules/interviews/websocket/interview.socket.js';
import { initializeResumeSocket } from './modules/resume/websocket/resume.socket.js';
import { AIInterviewTimeoutWorker } from './modules/interviews/AI-interview/services/ai.timeout.service.js';
import { initResumeProcessingWorker, shutdownResumeProcessing } from './modules/resume/queues/resume-queue.manager.js';
import { initMatchingWorker, shutdownMatchingSubsystem } from './modules/matching/queues/matching-queue.manager.js';
import { logger } from './common/logger/logger.js';
import prisma from './config/database.js';
import { InterviewSessionsServices } from './modules/interviews/services/interviews.service.js';
const port = env.port;
// Create HTTP server using Express
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: env.app.frontendUrl,
        credentials: true
    }
});
initializeInterviewSocket(io);
initializeResumeSocket(io);
async function startServer() {
    await connectDatabase();
    await ElasticsearchService.ensureIndex();
    await MatchingElasticsearchService.ensureIndices();
    // Initialize Background Workers
    initResumeProcessingWorker();
    initMatchingWorker();
    // Explicitly initialize AI Interview Timeout Worker with AI Socket.IO namespace
    const aiNamespace = io.of("/interviews/ai");
    AIInterviewTimeoutWorker.startWorker(aiNamespace);
    // Initialize Interview Auto-Expiry Background Scheduler (runs every 60s)
    InterviewSessionsServices.initAutoExpiryScheduler();
    // Start the HTTP + Socket.IO server
    httpServer.listen(port, () => {
        console.log(`Server is running on port http://localhost:${port}`);
    });
}
// Graceful shutdown handling
async function handleGracefulShutdown(signal) {
    logger.info(`[Server] Received ${signal}. Starting graceful shutdown...`);
    httpServer.close(async () => {
        logger.info("[Server] HTTP server closed.");
        try {
            await AIInterviewTimeoutWorker.stopWorker();
            io.close();
            await shutdownResumeProcessing();
            await shutdownMatchingSubsystem();
            await prisma.$disconnect();
            logger.info("[Server] Graceful shutdown completed.");
            process.exit(0);
        }
        catch (error) {
            logger.error({ err: error }, "[Server] Error during graceful shutdown");
            process.exit(1);
        }
    });
    // Force shutdown if cleanup takes longer than 15s
    setTimeout(() => {
        logger.error("[Server] Forced shutdown due to timeout.");
        process.exit(1);
    }, 15000).unref();
}
process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));
process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));
startServer().catch((error) => {
    console.error('Failed to start server');
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map