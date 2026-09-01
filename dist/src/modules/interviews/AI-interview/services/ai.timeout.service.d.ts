import type { Server } from "socket.io";
import { Queue } from "bullmq";
export declare function getInterviewTimeoutQueue(): Queue;
export declare class AIInterviewTimeoutWorker {
    private static intervalTimer;
    private static worker;
    private static socketIoInstance;
    /**
     * Tracks every in-flight checkAndExpireSessions() promise so that
     * stopWorker() can await all of them before returning, preventing
     * post-teardown Prisma/Socket operations in Jest.
     */
    private static readonly activeScans;
    static scheduleTimeoutJob(sessionId: string, durationMinutes: number): Promise<void>;
    static processSessionTimeout(sessionId: string, io?: Server): Promise<void>;
    static checkAndExpireSessions(io?: Server): Promise<void>;
    /**
     * Runs a DB expiry scan and registers its promise in activeScans so that
     * stopWorker() can await it. The promise removes itself from the Set when
     * it settles (whether it resolves or throws).
     */
    private static runTrackedScan;
    static startWorker(io: Server, intervalMs?: number): void;
    static stopWorker(): Promise<void>;
}
//# sourceMappingURL=ai.timeout.service.d.ts.map