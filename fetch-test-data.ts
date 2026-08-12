import prisma from './src/config/database.js';

async function main() {
    const company = await prisma.company.findFirst({
        where: {
            companyName: {
                contains: 'infosys',
                mode: 'insensitive'
            }
        },
        include: {
            jobs: {
                include: {
                    applications: {
                        include: {
                            candidate: true
                        }
                    }
                }
            },
            interviews: true,
            companyMembers: true
        }
    });

    if (!company) {
        console.log("No company found matching 'infosys'");
        return;
    }

    console.log("=== COMPANY ===");
    console.log(`Company Name: ${company.companyName}`);
    console.log(`Company ID (companyId): ${company.id}`);
    
    console.log("\n=== COMPANY MEMBER (For Authorization) ===");
    if (company.companyMembers.length > 0) {
        console.log(`Member ID: ${company.companyMembers[0].id}`);
        console.log(`User ID: ${company.companyMembers[0].userId}`);
        console.log(`Role: ${company.companyMembers[0].role}`);
    } else {
        console.log("No members found.");
    }

    console.log("\n=== INTERVIEWS ===");
    if (company.interviews.length > 0) {
        company.interviews.forEach(i => {
            console.log(`Interview Title: ${i.title}`);
            console.log(`Interview ID (interviewId): ${i.id}`);
            console.log(`Status: ${i.status}`);
            console.log("---");
        });
    } else {
        console.log("No interviews found for this company. You need to create one using POST /:companyId/create/interview");
    }

    console.log("\n=== APPLICATIONS ===");
    let appCount = 0;
    company.jobs.forEach(job => {
        if (job.applications.length > 0) {
            console.log(`Job: ${job.title} (ID: ${job.id})`);
            job.applications.forEach(app => {
                console.log(`  Application ID (applicationId): ${app.id}`);
                console.log(`  Candidate: ${app.candidate.fullName}`);
                console.log(`  Status: ${app.status}`);
                appCount++;
            });
        }
    });

    if (appCount === 0) {
        console.log("No applications found for any jobs at this company.");
    }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
