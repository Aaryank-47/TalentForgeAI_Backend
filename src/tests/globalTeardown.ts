/**
 * Jest Global Teardown
 *
 * Runs once after ALL test suites have completed. Responsible for closing every
 * long-lived async resource that would otherwise prevent Jest from exiting:
 *
 *  1. The singleton BullMQ Resume-Processing Queue  (Redis connection)
 *  2. The singleton BullMQ AI-Interview Timeout Queue (Redis connection)
 *  3. The Prisma Client + underlying pg.Pool           (PostgreSQL connections)
 *
 * Each import is wrapped in a try/catch so a teardown failure in one subsystem
 * never masks failures in another.
 */
export default async function globalTeardown(): Promise<void> {
    // 1. Close the BullMQ Resume Processing Queue singleton
    try {
        const { closeResumeProcessingQueue } = await import(
            "../modules/resume/queues/resume-processing.queue.js"
        );
        await closeResumeProcessingQueue();
    } catch {
        // Queue may not have been initialised in this run – that is fine.
    }

    // 2. Close the BullMQ AI-Interview Timeout Worker + Queue singleton
    try {
        const { AIInterviewTimeoutWorker } = await import(
            "../modules/interviews/AI-interview/services/ai.timeout.service.js"
        );
        await AIInterviewTimeoutWorker.stopWorker();
    } catch {
        // May not have been started in this run – that is fine.
    }

    // 3. Disconnect Prisma and drain the pg connection pool
    try {
        const { closeDatabase } = await import("../config/database.js");
        await closeDatabase();
    } catch {
        // Ignore if already closed by an individual test's afterAll.
    }
}
