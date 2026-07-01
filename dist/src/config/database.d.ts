import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
declare const prisma: PrismaClient<{
    adapter: PrismaPg;
}, never, import("@prisma/client/runtime/client").DefaultArgs>;
export declare function connectDatabase(): Promise<void>;
export default prisma;
//# sourceMappingURL=database.d.ts.map