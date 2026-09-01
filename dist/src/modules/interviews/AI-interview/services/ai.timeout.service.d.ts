import type { Server } from "socket.io";
import { Queue } from "bullmq";
export declare function getInterviewTimeoutQueue(): Queue;
export declare class AIInterviewTimeoutWorker {
    private static intervalTimer;
    private static worker;
    private static socketIoInstance;
    static scheduleTimeoutJob(sessionId: string, durationMinutes: number): Promise<void>;
    static processSessionTimeout(sessionId: string, io?: Server): Promise<void>;
    static checkAndExpireSessions(io?: Server): Promise<void>;
    static startWorker(io: Server, intervalMs?: number): void;
    static stopWorker(): Promise<void>;
}
//# sourceMappingURL=ai.timeout.service.d.ts.map