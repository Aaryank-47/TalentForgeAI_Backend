import dotenv from 'dotenv';
import { defineConfig } from "prisma/config";
dotenv.config({ path: "src/config/.env" });
// console.log("DATABASE_URL=", process.env.DATABASE_URL);
export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        url: process.env["DATABASE_URL"],
    },
});
//# sourceMappingURL=prisma.config.js.map