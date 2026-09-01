import { afterAll } from "@jest/globals";
import whyIsNodeRunning from "why-is-node-running";

afterAll(async () => {
    if (process.env.DEBUG_OPEN_HANDLES === "true" || process.env.DETECT_OPEN_HANDLES === "true") {
        // Wait a brief moment for normal async operations in the suite to settle
        await new Promise((resolve) => setTimeout(resolve, 500));
        whyIsNodeRunning();
    }
});

