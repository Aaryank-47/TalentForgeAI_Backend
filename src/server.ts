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
import {
  initResumeProcessingWorker,
  shutdownResumeProcessing
} from './modules/resume/queues/resume-queue.manager.js';
import {
  initMatchingWorker,
  shutdownMatchingSubsystem
} from './modules/matching/queues/matching-queue.manager.js';
import { logger } from './common/logger/logger.js';
import prisma from './config/database.js';
import { InterviewSessionsServices } from './modules/interviews/services/interviews.service.js';

const port = env.port;

const httpServer = createServer(app);

httpServer.on("error", (error) => {
  console.error("[Server] HTTP server error:", error);
  process.exit(1);
});

const io = new Server(httpServer, {
  cors: {
    origin: [
      env.app.frontendUrl,
      env.app.frontendUrlTwo
    ].filter((url): url is string => !!url),
    credentials: true
  }
});

initializeInterviewSocket(io);
initializeResumeSocket(io);

async function startServer() {
  console.log("[Startup] Starting server...");

  // Start HTTP server first so Render can detect the port.
  console.log(`[Startup] Starting HTTP server on port ${port}...`);

  httpServer.listen(port, "0.0.0.0", () => {
    console.log(`[Startup] HTTP server listening on port ${port}`);
  });

  try {
    console.log("[Startup] Connecting to PostgreSQL...");
    await connectDatabase();
    console.log("[Startup] PostgreSQL connected.");

    console.log("[Startup] Ensuring Elasticsearch index...");
    await ElasticsearchService.ensureIndex();
    console.log("[Startup] Elasticsearch index ready.");

    console.log("[Startup] Ensuring matching Elasticsearch indices...");
    await MatchingElasticsearchService.ensureIndices();
    console.log("[Startup] Matching Elasticsearch indices ready.");

    console.log("[Startup] Initializing resume worker...");
    initResumeProcessingWorker();
    console.log("[Startup] Resume worker initialized.");

    console.log("[Startup] Initializing matching worker...");
    initMatchingWorker();
    console.log("[Startup] Matching worker initialized.");

    console.log("[Startup] Starting AI interview worker...");
    const aiNamespace = io.of("/interviews/ai") as unknown as Server;
    AIInterviewTimeoutWorker.startWorker(aiNamespace);
    console.log("[Startup] AI interview worker initialized.");

    console.log("[Startup] Starting interview expiry scheduler...");
    InterviewSessionsServices.initAutoExpiryScheduler();
    console.log("[Startup] Interview expiry scheduler initialized.");

    console.log("[Startup] Server initialization completed successfully.");

  } catch (error) {
    console.error("[Startup] Server initialization failed:", error);

    httpServer.close(() => {
      console.error("[Startup] HTTP server closed due to startup failure.");
      process.exit(1);
    });
  }
}

async function handleGracefulShutdown(signal: string) {
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
    } catch (error) {
      logger.error(
        { err: error },
        "[Server] Error during graceful shutdown"
      );

      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.error("[Server] Forced shutdown due to timeout.");
    process.exit(1);
  }, 15000).unref();
}

process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));
process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));

startServer().catch((error) => {
  console.error("[Startup] Failed to start server:", error);
  process.exit(1);
});