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
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error(
        "Invalid Environment Variables:",
        parsedEnv.error.flatten().fieldErrors
    );

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
    },
    gmail: {
        user: parsedEnv.data.GMAIL_USER,
        pass: parsedEnv.data.GMAIL_PASS,
    },
    cloudinary: {
        apiKey: parsedEnv.data.CLOUDINARY_API_KEY,
        apiSecret: parsedEnv.data.CLOUDINARY_API_SECRET,
        cloudName: parsedEnv.data.CLOUDINARY_CLOUD_NAME,    
    }
} as const;

export default env;
