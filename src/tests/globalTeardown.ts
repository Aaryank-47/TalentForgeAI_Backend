/**
 * Jest Global Teardown
 *
 * Runs once after ALL test suites have completed in a SEPARATE Node.js context
 * from the tests. This means dynamic imports here create fresh module instances
 * and cannot close singletons held by the test process.
 *
 * Responsibilities:
 *  1. BullMQ Resume-Processing Queue  – the afterAll hooks in each queue-using
 *     test suite close the singleton via closeResumeProcessingQueue(). This
 *     teardown is a belt-and-braces fallback for any suite that doesn't.
 *  2. BullMQ AI-Interview Timeout Worker – same belt-and-braces approach.
 *
 * NOTE: The pg.Pool (Prisma) is NOT closed here because globalTeardown's
 * module context is separate from the test runner's context. The Pool is kept
 * from blocking Jest's exit via `allowExitOnIdle: true` in database.ts.
 */
export default async function globalTeardown(): Promise<void> {
    // 1. Belt-and-braces: close the BullMQ Resume Processing Queue singleton.
    //    Individual test afterAll hooks are the primary mechanism; this catches
    //    any suite that may have been skipped or threw before its afterAll ran.
    try {
        const { closeResumeProcessingQueue } = await import(
            "../modules/resume/queues/resume-processing.queue.js"
        );
        await closeResumeProcessingQueue();
    } catch {
        // Queue may not have been initialised in this run – that is fine.
    }

    // 2. Belt-and-braces: close the AI-Interview Timeout Worker + Queue.
    try {
        const { AIInterviewTimeoutWorker } = await import(
            "../modules/interviews/AI-interview/services/ai.timeout.service.js"
        );
        await AIInterviewTimeoutWorker.stopWorker();
    } catch {
        // May not have been started in this run – that is fine.
    }
}

