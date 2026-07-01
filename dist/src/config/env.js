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
    },
};
export default env;
//# sourceMappingURL=env.js.map