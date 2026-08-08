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
};

export default config;