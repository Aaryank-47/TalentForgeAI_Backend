import { afterAll } from "@jest/globals";
import whyIsNodeRunning from "why-is-node-running";

afterAll(async () => {
    if (process.env.DEBUG_OPEN_HANDLES === "true" || process.env.DETECT_OPEN_HANDLES === "true") {
        // Wait a brief moment for normal async operations in the suite to settle
        await new Promise((resolve) => setTimeout(resolve, 500));
        whyIsNodeRunning();
    }

    // Release Prisma's connection back to the pg.Pool so idle clients can be
    // unref()'d (pool has allowExitOnIdle: true in test mode).  Prisma reconnects
    // lazily on the first query of the next suite, so this is safe in --runInBand.
    try {
        const { default: prisma } = await import("../config/database.js");
        await prisma.$disconnect();
    } catch {
        // Ignore – prisma may not have been used in this suite
    }
    try {
        const { ResumeProcessingStateService } = await import("../modules/resume/services/resume-processing-state.service.js");
        await ResumeProcessingStateService.closeConnection();
    } catch {
        // Ignore
    }
});

