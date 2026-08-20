import { PrismaClient, SkillCategory } from "@prisma/client";
import { normalizeSkillLookupKey } from "../../src/modules/resume/utils/resume-normalization.utils.js";

export interface SkillSeedDefinition {
    name: string;
    slug: string;
    category: SkillCategory;
    aliases: string[];
}

export const INITIAL_SKILL_TAXONOMY: SkillSeedDefinition[] = [
    // Programming Languages
    { name: "JavaScript", slug: "javascript", category: SkillCategory.PROGRAMMING_LANGUAGE, aliases: ["js", "javascript"] },
    { name: "TypeScript", slug: "typescript", category: SkillCategory.PROGRAMMING_LANGUAGE, aliases: ["ts", "typescript"] },
    { name: "Python", slug: "python", category: SkillCategory.PROGRAMMING_LANGUAGE, aliases: ["python", "py"] },
    { name: "Java", slug: "java", category: SkillCategory.PROGRAMMING_LANGUAGE, aliases: ["java"] },
    { name: "C++", slug: "c-plus-plus", category: SkillCategory.PROGRAMMING_LANGUAGE, aliases: ["c++", "cpp"] },
    { name: "C#", slug: "c-sharp", category: SkillCategory.PROGRAMMING_LANGUAGE, aliases: ["c#", "csharp"] },
    { name: "Go", slug: "go", category: SkillCategory.PROGRAMMING_LANGUAGE, aliases: ["go", "golang"] },
    { name: "Rust", slug: "rust", category: SkillCategory.PROGRAMMING_LANGUAGE, aliases: ["rust"] },
    { name: "PHP", slug: "php", category: SkillCategory.PROGRAMMING_LANGUAGE, aliases: ["php"] },
    { name: "Ruby", slug: "ruby", category: SkillCategory.PROGRAMMING_LANGUAGE, aliases: ["ruby"] },

    // Frontend Frameworks & Libraries
    { name: "React", slug: "react", category: SkillCategory.FRONTEND, aliases: ["react", "reactjs", "react.js", "react js"] },
    { name: "React Native", slug: "react-native", category: SkillCategory.MOBILE, aliases: ["react native", "react-native"] },
    { name: "Angular", slug: "angular", category: SkillCategory.FRONTEND, aliases: ["angular", "angularjs", "angular.js", "angular js"] },
    { name: "Vue.js", slug: "vue-js", category: SkillCategory.FRONTEND, aliases: ["vue", "vuejs", "vue.js", "vue js"] },
    { name: "Next.js", slug: "next-js", category: SkillCategory.FRONTEND, aliases: ["next", "nextjs", "next.js", "next js"] },
    { name: "HTML5", slug: "html5", category: SkillCategory.FRONTEND, aliases: ["html", "html5"] },
    { name: "CSS3", slug: "css3", category: SkillCategory.FRONTEND, aliases: ["css", "css3"] },
    { name: "Tailwind CSS", slug: "tailwind-css", category: SkillCategory.FRONTEND, aliases: ["tailwind", "tailwindcss", "tailwind css"] },

    // Backend Frameworks
    { name: "Node.js", slug: "node-js", category: SkillCategory.BACKEND, aliases: ["node", "nodejs", "node.js", "node js"] },
    { name: "Express.js", slug: "express-js", category: SkillCategory.BACKEND, aliases: ["express", "expressjs", "express.js", "express js"] },
    { name: "NestJS", slug: "nestjs", category: SkillCategory.BACKEND, aliases: ["nest", "nestjs", "nest.js", "nest js"] },
    { name: "Django", slug: "django", category: SkillCategory.BACKEND, aliases: ["django"] },
    { name: "FastAPI", slug: "fastapi", category: SkillCategory.BACKEND, aliases: ["fastapi", "fast api"] },
    { name: "Spring Boot", slug: "spring-boot", category: SkillCategory.BACKEND, aliases: ["spring boot", "springboot"] },
    { name: ".NET", slug: "dotnet", category: SkillCategory.BACKEND, aliases: [".net", "dotnet"] },
    { name: "ASP.NET", slug: "asp-dotnet", category: SkillCategory.BACKEND, aliases: ["asp.net", "aspnet"] },

    // Databases
    { name: "PostgreSQL", slug: "postgresql", category: SkillCategory.DATABASE, aliases: ["postgres", "postgresql", "postgre sql"] },
    { name: "MySQL", slug: "mysql", category: SkillCategory.DATABASE, aliases: ["mysql", "my sql"] },
    { name: "MongoDB", slug: "mongodb", category: SkillCategory.DATABASE, aliases: ["mongo", "mongodb", "mongo db"] },
    { name: "Redis", slug: "redis", category: SkillCategory.DATABASE, aliases: ["redis"] },
    { name: "SQLite", slug: "sqlite", category: SkillCategory.DATABASE, aliases: ["sqlite"] },

    // DevOps & Cloud
    { name: "Docker", slug: "docker", category: SkillCategory.DEVOPS, aliases: ["docker"] },
    { name: "Kubernetes", slug: "kubernetes", category: SkillCategory.DEVOPS, aliases: ["k8s", "kubernetes"] },
    { name: "AWS", slug: "aws", category: SkillCategory.CLOUD, aliases: ["aws", "amazon web services"] },
    { name: "Azure", slug: "azure", category: SkillCategory.CLOUD, aliases: ["azure", "microsoft azure"] },
    { name: "GCP", slug: "gcp", category: SkillCategory.CLOUD, aliases: ["gcp", "google cloud platform"] },
    { name: "GitHub Actions", slug: "github-actions", category: SkillCategory.DEVOPS, aliases: ["github actions"] },
    { name: "Terraform", slug: "terraform", category: SkillCategory.DEVOPS, aliases: ["terraform"] },

    // Tools & APIs
    { name: "Git", slug: "git", category: SkillCategory.TOOLS, aliases: ["git"] },
    { name: "GitHub", slug: "github", category: SkillCategory.TOOLS, aliases: ["github"] },
    { name: "GitLab", slug: "gitlab", category: SkillCategory.TOOLS, aliases: ["gitlab"] },
    { name: "GraphQL", slug: "graphql", category: SkillCategory.TOOLS, aliases: ["graphql"] },
    { name: "REST API", slug: "rest-api", category: SkillCategory.TOOLS, aliases: ["rest api", "restful api", "rest apis"] },

    // AI / ML
    { name: "TensorFlow", slug: "tensorflow", category: SkillCategory.AI_ML, aliases: ["tensorflow"] },
    { name: "PyTorch", slug: "pytorch", category: SkillCategory.AI_ML, aliases: ["pytorch"] },
    { name: "Scikit-learn", slug: "scikit-learn", category: SkillCategory.AI_ML, aliases: ["scikit-learn", "sklearn"] },
    { name: "LangChain", slug: "langchain", category: SkillCategory.AI_ML, aliases: ["langchain"] },
    { name: "LangGraph", slug: "langgraph", category: SkillCategory.AI_ML, aliases: ["langgraph"] },
    { name: "OpenAI", slug: "openai", category: SkillCategory.AI_ML, aliases: ["openai"] }
];

export async function seedSkillTaxonomy(prisma: PrismaClient): Promise<void> {
    console.log("[SkillSeed] Seeding initial Skill Taxonomy...");

    for (const item of INITIAL_SKILL_TAXONOMY) {
        const skill = await prisma.skill.upsert({
            where: { slug: item.slug },
            update: {
                name: item.name,
                category: item.category,
                isActive: true
            },
            create: {
                name: item.name,
                slug: item.slug,
                category: item.category,
                isActive: true
            }
        });

        for (const aliasText of item.aliases) {
            const normalizedAlias = normalizeSkillLookupKey(aliasText);
            if (!normalizedAlias) continue;

            await prisma.skillAlias.upsert({
                where: { normalizedAlias },
                update: {
                    skillId: skill.id,
                    alias: aliasText
                },
                create: {
                    skillId: skill.id,
                    alias: aliasText,
                    normalizedAlias
                }
            });
        }
    }

    console.log("[SkillSeed] Skill Taxonomy seeded successfully.");
}
