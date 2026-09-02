import dotenv from "dotenv";
import { z } from "zod";
dotenv.config({
    path: "src/config/.env",
});
const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().min(1),
    JWT_ACCESS_SECRET: z.string().min(1),
    JWT_REFRESH_SECRET: z.string().min(1),
    JWT_ACCESS_EXPIRES_IN: z.string(),
    JWT_REFRESH_EXPIRES_IN: z.string(),
    GMAIL_USER: z.string().min(1),
    GMAIL_PASS: z.string().min(1),
    RESET_PASSWORD_SECRET: z.string().min(1),
    RESET_PASSWORD_EXPIRES_IN: z.string(),
    CLOUDINARY_API_KEY: z.string().min(1),
    CLOUDINARY_API_SECRET: z.string().min(1),
    CLOUDINARY_CLOUD_NAME: z.string().min(1),
    INVITATION_TOKEN_SECRET: z.string().min(1),
    INVITATION_TOKEN_EXPIRES_IN: z.string(),
    FRONTEND_URL: z.string(),
    ELASTICSEARCH_URL: z.string().min(1).default("http://localhost:9200"),
    ELASTICSEARCH_USERNAME: z.string().optional(),
    ELASTICSEARCH_PASSWORD: z.string().optional(),
    ELASTICSEARCH_API_KEY: z.string().optional(),
    OPENROUTER_API_KEY: z.string().min(1),
    OPENROUTER_BASE_URL: z.string().min(1).default("https://openrouter.ai/api/v1"),
    OPENROUTER_MODEL: z.string().min(1),
    OPENROUTER_TIMEOUT_MS: z.coerce.number().default(30000),
    REDIS_URL: z.string().optional(),
    REDIS_HOST: z.string().default("localhost"),
    REDIS_PORT: z.coerce.number().default(6379),
    RESUME_WORKER_CONCURRENCY: z.coerce.number().default(2),
    RESUME_JOB_ATTEMPTS: z.coerce.number().default(3),
    RESUME_JOB_BACKOFF_DELAY_MS: z.coerce.number().default(5000),
    RESEND_API_KEY: z.string().min(1),
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    console.error("Invalid Environment Variables:", parsedEnv.error.flatten().fieldErrors);
    process.exit(1);
}
export const env = {
    nodeEnv: parsedEnv.data.NODE_ENV,
    port: parsedEnv.data.PORT,
    databaseUrl: parsedEnv.data.DATABASE_URL,
    jwt: {
        accessSecret: parsedEnv.data.JWT_ACCESS_SECRET,
        refreshSecret: parsedEnv.data.JWT_REFRESH_SECRET,
        accessExpiresIn: parsedEnv.data.JWT_ACCESS_EXPIRES_IN,
        refreshExpiresIn: parsedEnv.data.JWT_REFRESH_EXPIRES_IN,
        resetPasswordSecret: parsedEnv.data.RESET_PASSWORD_SECRET,
        resetPasswordExpiresIn: parsedEnv.data.RESET_PASSWORD_EXPIRES_IN,
        invitationTokenSecret: parsedEnv.data.INVITATION_TOKEN_SECRET,
        invitationTokenExpiresIn: parsedEnv.data.INVITATION_TOKEN_EXPIRES_IN,
    },
    gmail: {
        user: parsedEnv.data.GMAIL_USER,
        pass: parsedEnv.data.GMAIL_PASS,
    },
    cloudinary: {
        apiKey: parsedEnv.data.CLOUDINARY_API_KEY,
        apiSecret: parsedEnv.data.CLOUDINARY_API_SECRET,
        cloudName: parsedEnv.data.CLOUDINARY_CLOUD_NAME,
    },
    app: {
        frontendUrl: parsedEnv.data.FRONTEND_URL,
    },
    elasticsearch: {
        url: parsedEnv.data.ELASTICSEARCH_URL,
        username: parsedEnv.data.ELASTICSEARCH_USERNAME,
        password: parsedEnv.data.ELASTICSEARCH_PASSWORD,
        apiKey: parsedEnv.data.ELASTICSEARCH_API_KEY,
    },
    openRouter: {
        apiKey: parsedEnv.data.OPENROUTER_API_KEY,
        baseUrl: parsedEnv.data.OPENROUTER_BASE_URL,
        model: parsedEnv.data.OPENROUTER_MODEL,
        timeoutMs: parsedEnv.data.OPENROUTER_TIMEOUT_MS,
    },
    redis: {
        url: parsedEnv.data.REDIS_URL,
        host: parsedEnv.data.REDIS_HOST,
        port: parsedEnv.data.REDIS_PORT,
    },
    queue: {
        resumeWorkerConcurrency: parsedEnv.data.RESUME_WORKER_CONCURRENCY,
        resumeJobAttempts: parsedEnv.data.RESUME_JOB_ATTEMPTS,
        resumeJobBackoffDelayMs: parsedEnv.data.RESUME_JOB_BACKOFF_DELAY_MS,
    },
    resend: {
        apiKey: parsedEnv.data.RESEND_API_KEY,
    }
};
export default env;
//# sourceMappingURL=env.js.map