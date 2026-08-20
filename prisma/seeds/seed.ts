import prisma from "../../src/config/database.js";
import { UserRole, AccountStatus } from "@prisma/client";
import { PasswordHelper } from "../../src/common/helper/password.helper.js";
import { seedSkillTaxonomy } from "./skill.seed.js";

const existing = await prisma.user.findFirst({
    where: {
        role: UserRole.SUPER_ADMIN,
    },
});

if (!existing) {
    await prisma.user.create({
        data: {
            email: "superadmin@talentforge.ai",
            password: await PasswordHelper.hash("SuperAdmin@123"),
            role: UserRole.SUPER_ADMIN,
            status: AccountStatus.ACTIVE,
            isEmailVerified: true,
        },
    });
}

await seedSkillTaxonomy(prisma);