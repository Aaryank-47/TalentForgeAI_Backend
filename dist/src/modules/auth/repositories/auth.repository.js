import { AccountStatus, UserRole } from "@prisma/client";
import prisma from "../../../config/database.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { createUniqueSlugSeed } from "../utils/auth.utils.js";
const nullableString = (value) => value ?? null;
const nullableNumber = (value) => value ?? null;
const userSelect = {
    id: true,
    email: true,
    role: true,
    status: true,
    isEmailVerified: true,
    lastLoginAt: true,
    createdAt: true,
    updatedAt: true,
};
const candidateSelect = {
    id: true,
    userId: true,
    firstName: true,
    lastName: true,
    phone: true,
    profilePicture: true,
    headline: true,
    bio: true,
    gender: true,
    experienceLevel: true,
    currentLocation: true,
    preferredLocation: true,
    currentCompany: true,
    currentDesignation: true,
    totalExperience: true,
    expectedSalary: true,
    currentSalary: true,
    noticePeriod: true,
    linkedinUrl: true,
    githubUrl: true,
    portfolioUrl: true,
    websiteUrl: true,
    isOpenToWork: true,
    profileCompleted: true,
    createdAt: true,
    updatedAt: true,
};
const companySelect = {
    id: true,
    name: true,
    slug: true,
    email: true,
    phone: true,
    website: true,
    logo: true,
    coverImage: true,
    description: true,
    industry: true,
    companySize: true,
    foundedYear: true,
    headquarters: true,
    linkedinUrl: true,
    twitterUrl: true,
    isVerified: true,
    createdAt: true,
    updatedAt: true,
};
const recruiterSelect = {
    id: true,
    userId: true,
    companyId: true,
    firstName: true,
    lastName: true,
    phone: true,
    designation: true,
    department: true,
    profilePicture: true,
    linkedinUrl: true,
    isPrimaryRecruiter: true,
    canCreateJobs: true,
    canEditJobs: true,
    canDeleteJobs: true,
    canScheduleInterview: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
};
export class AuthRepository {
    static async findUserByEmail(email) {
        return prisma.user.findUnique({
            where: { email },
            select: userSelect,
        });
    }
    static async createCandidateRegistration(data) {
        return prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    password: data.password,
                    role: UserRole.CANDIDATE,
                    status: AccountStatus.ACTIVE,
                    isEmailVerified: false,
                },
                select: userSelect,
            });
            const candidate = await tx.candidate.create({
                data: {
                    userId: user.id,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phone: nullableString(data.phone),
                    profilePicture: nullableString(data.profilePicture),
                    headline: nullableString(data.headline),
                    bio: nullableString(data.bio),
                    gender: data.gender ?? null,
                    experienceLevel: data.experienceLevel ?? null,
                    currentLocation: nullableString(data.currentLocation),
                    preferredLocation: nullableString(data.preferredLocation),
                    currentCompany: nullableString(data.currentCompany),
                    currentDesignation: nullableString(data.currentDesignation),
                    totalExperience: nullableNumber(data.totalExperience),
                    expectedSalary: nullableNumber(data.expectedSalary),
                    currentSalary: nullableNumber(data.currentSalary),
                    noticePeriod: nullableNumber(data.noticePeriod),
                    linkedinUrl: nullableString(data.linkedinUrl),
                    githubUrl: nullableString(data.githubUrl),
                    portfolioUrl: nullableString(data.portfolioUrl),
                    websiteUrl: nullableString(data.websiteUrl),
                    ...(data.isOpenToWork !== undefined
                        ? { isOpenToWork: data.isOpenToWork }
                        : {}),
                },
                select: candidateSelect,
            });
            return { user, candidate };
        });
    }
    static async findCompanyById(companyId) {
        return prisma.company.findUnique({
            where: { id: companyId },
            select: companySelect,
        });
    }
    static async createCompany(companyInput) {
        return prisma.$transaction(async (tx) => {
            const baseSlug = createUniqueSlugSeed(companyInput.slug ?? companyInput.name);
            let slug = baseSlug;
            let suffix = 1;
            while (await tx.company.findUnique({ where: { slug } })) {
                slug = `${baseSlug}-${suffix}`;
                suffix += 1;
            }
            return tx.company.create({
                data: {
                    name: companyInput.name,
                    slug,
                    email: nullableString(companyInput.email),
                    phone: nullableString(companyInput.phone),
                    website: nullableString(companyInput.website),
                    logo: nullableString(companyInput.logo),
                    coverImage: nullableString(companyInput.coverImage),
                    description: nullableString(companyInput.description),
                    industry: nullableString(companyInput.industry),
                    companySize: nullableString(companyInput.companySize),
                    foundedYear: nullableNumber(companyInput.foundedYear),
                    headquarters: nullableString(companyInput.headquarters),
                    linkedinUrl: nullableString(companyInput.linkedinUrl),
                    twitterUrl: nullableString(companyInput.twitterUrl),
                },
                select: companySelect,
            });
        });
    }
    static async createRecruiterRegistration(data) {
        return prisma.$transaction(async (tx) => {
            let company = null;
            if (data.companyId) {
                company = await tx.company.findUnique({
                    where: { id: data.companyId },
                    select: companySelect,
                });
                if (!company) {
                    throw new NotFoundError("Company not found.");
                }
            }
            else if (data.company) {
                const baseSlug = createUniqueSlugSeed(data.company.slug ?? data.company.name);
                let slug = baseSlug;
                let suffix = 1;
                while (await tx.company.findUnique({ where: { slug } })) {
                    slug = `${baseSlug}-${suffix}`;
                    suffix += 1;
                }
                company = await tx.company.create({
                    data: {
                        name: data.company.name,
                        slug,
                        email: nullableString(data.company.email),
                        phone: nullableString(data.company.phone),
                        website: nullableString(data.company.website),
                        logo: nullableString(data.company.logo),
                        coverImage: nullableString(data.company.coverImage),
                        description: nullableString(data.company.description),
                        industry: nullableString(data.company.industry),
                        companySize: nullableString(data.company.companySize),
                        foundedYear: nullableNumber(data.company.foundedYear),
                        headquarters: nullableString(data.company.headquarters),
                        linkedinUrl: nullableString(data.company.linkedinUrl),
                        twitterUrl: nullableString(data.company.twitterUrl),
                    },
                    select: companySelect,
                });
            }
            if (!company) {
                throw new NotFoundError("Company not found.");
            }
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    password: data.password,
                    role: UserRole.RECRUITER,
                    status: AccountStatus.ACTIVE,
                    isEmailVerified: false,
                },
                select: userSelect,
            });
            const recruiter = await tx.recruiter.create({
                data: {
                    userId: user.id,
                    companyId: company.id,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phone: nullableString(data.phone),
                    designation: nullableString(data.designation),
                    department: nullableString(data.department),
                    profilePicture: nullableString(data.profilePicture),
                    linkedinUrl: nullableString(data.linkedinUrl),
                    ...(data.isPrimaryRecruiter !== undefined
                        ? { isPrimaryRecruiter: data.isPrimaryRecruiter }
                        : {}),
                    ...(data.canCreateJobs !== undefined
                        ? { canCreateJobs: data.canCreateJobs }
                        : {}),
                    ...(data.canEditJobs !== undefined
                        ? { canEditJobs: data.canEditJobs }
                        : {}),
                    ...(data.canDeleteJobs !== undefined
                        ? { canDeleteJobs: data.canDeleteJobs }
                        : {}),
                    ...(data.canScheduleInterview !== undefined
                        ? { canScheduleInterview: data.canScheduleInterview }
                        : {}),
                },
                select: recruiterSelect,
            });
            return { user, company, recruiter };
        });
    }
    static async saveRefreshToken(data) {
        return prisma.refreshToken.create({
            data,
        });
    }
}
//# sourceMappingURL=auth.repository.js.map