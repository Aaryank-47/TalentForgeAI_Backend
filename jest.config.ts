import type { Config } from "jest";
import { createDefaultEsmPreset } from "ts-jest";

const presetConfig = createDefaultEsmPreset({
    tsconfig: "./tsconfig.json",
});

const config: Config = {
    ...presetConfig,

    testEnvironment: "node",

    roots: ["<rootDir>/src"],

    testMatch: [
        "**/tests/**/*.test.ts"
    ],

    testPathIgnorePatterns: [
        "/node_modules/",
        "/dist/",
    ],

    clearMocks: true,

    extensionsToTreatAsEsm: [".ts"],

    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },

    // Closes all singleton async handles (BullMQ queues, Prisma pool) after
    // every test suite finishes so Jest can exit cleanly.
    globalTeardown: "<rootDir>/src/tests/globalTeardown.ts",

    // Runs after the test framework is set up in each test file to log open handles
    setupFilesAfterEnv: ["<rootDir>/src/tests/jest.setup.ts"],

    // Give open-handle detection a 10-second grace window before Jest force-kills.
    openHandlesTimeout: 10000,
};

export default config;