import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import env from "./env.js";
const pool = new Pool({ connectionString: env.databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
export async function connectDatabase() {
    try {
        await prisma.$connect();
        console.log("✔️  PostgreSQL Connected");
    }
    catch (error) {
        console.error("❌ Database Connection Failed");
        console.error(error);
        process.exit(1);
    }
}
export default prisma;
//# sourceMappingURL=database.js.map