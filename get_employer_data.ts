import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import prisma from './src/config/database.js';
dotenv.config();

async function main() {
    const email = 'employer@example.com';
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            employer: true,
            companyMemberships: {
                include: {
                    company: true
                }
            }
        }
    });

    if (!user) {
        console.log(`User with email ${email} not found.`);
        return;
    }

    const payload = {
        id: user.id,
        email: user.email,
        role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

    console.log("=== USER DATA ===");
    console.log(JSON.stringify(user, null, 2));
    
    if (user.companyMemberships.length > 0) {
        console.log("\n=== COMPANY DATA ===");
        console.log(`Company ID: ${user.companyMemberships[0].companyId}`);
        console.log(`Company Slug: ${user.companyMemberships[0].company.slug}`);
    }

    console.log("\n=== POSTMAN AUTHORIZATION TOKEN ===");
    console.log(`Bearer ${token}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
