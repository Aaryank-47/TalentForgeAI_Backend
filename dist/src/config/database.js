import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
dotenv.config({ path: "src/config/.env" });
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
}
const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
export async function connectDatabase() {
    try {
        await prisma.$connect();
        console.log("✅ PostgreSQL Connected");
    }
    catch (error) {
        console.error("❌ Database Connection Failed");
        console.error(error);
        process.exit(1);
    }
}
export default prisma;
//# sourceMappingURL=database.js.map