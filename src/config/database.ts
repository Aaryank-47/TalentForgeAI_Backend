import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import env from "./env.js";

const pool = new Pool({
    connectionString: env.databaseUrl,
    // In test mode, do not hold the Node.js event loop open when all clients
    // are idle. This lets Jest exit cleanly after all tests complete without
    // requiring --forceExit. Has no effect in production (default: false).
    allowExitOnIdle: process.env.NODE_ENV === "test"
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function connectDatabase() {
    try {
        await prisma.$connect();

        console.log("✔️  PostgreSQL Connected");
    } catch (error) {
        console.error("❌ Database Connection Failed");
        console.error(error);

        process.exit(1);
    }
}

export async function closeDatabase() {
    await prisma.$disconnect();
    await pool.end();
}

export default prisma;