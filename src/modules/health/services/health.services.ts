import prisma from "../../../config/database.js";
import { env } from "../../../config/env.js"

export class HealthService {
    static async checkServerHealth() {

        return {
            server: "UP",
            environment: env.nodeEnv,
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        };
    }

    static async checkDatabaseHealth() {
        await prisma.$queryRaw`SELECT 1`;
        return {
            database: "UP",
            timestamp: new Date().toISOString()
        };
    }
}