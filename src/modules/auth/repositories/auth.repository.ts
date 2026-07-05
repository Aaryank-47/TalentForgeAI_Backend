import { AccountStatus, UserRole } from "@prisma/client";
import prisma from "../../../config/database.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
// import type { CandidateProfileView } from "../../candidate/interfaces/candidate.interface.js";
import type { CandidateRegistrationView, ProfileViewResult } from "../interfaces/auth.interface.js"
import type { RecruiterCompanyInput, RecruiterCompanyView, RecruiterProfileView } from "../../recruiter/interfaces/recruiter.interface.js";
import { createUniqueSlugSeed } from "../utils/auth.utils.js";

import type {
    RegisterCandidateInput,
    RegisterRecruiterInput,
    AuthUserView,
} from "../interfaces/auth.interface.js";

const nullableString = (value: string | undefined): string | null => value ?? null;
const nullableNumber = (value: number | undefined): number | null => value ?? null;

const userSelect = {
    id: true,
    email: true,
    role: true,
    status: true,
    isEmailVerified: true,
    lastLoginAt: true,
    createdAt: true,
    updatedAt: true,
} as const;

const candidateSelect = {
    id: true,
    userId: true,
    fullName: true,
    createdAt: true,
    updatedAt: true,
} as const;

const candidateProfileSelect = {
    id: true,
    userId: true,
    fullName: true,
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
} as const;

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
} as const;

const loginUserSelect = {
    id: true,
    email: true,
    password: true,
    role: true,
    status: true,
    isEmailVerified: true,
    lastLoginAt: true,
    createdAt: true,
    updatedAt: true,
    candidate: {
        select: candidateSelect
    },
    recruiter: {
        select: recruiterSelect
    },
} as const;

export class AuthRepository {
    static async findUserByEmail(email: string): Promise<AuthUserView | null> {
        console.log("Finding user by email inside auth repository:", email);
        return prisma.user.findUnique({
            where: { email },
            select: userSelect,
        });
    }

    static async findLoginUserByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email },
            select: loginUserSelect,
        });
    }

    static async findUserById(userId: string): Promise<AuthUserView | null> {
        return prisma.user.findUnique({
            where: { id: userId },
            select: userSelect,
        });
    }

    static async findUserWithPasswordById(userId: string) {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            password: true,
        },
    });
}

    static async findProfileByUserId(
        userId: string
    ): Promise<ProfileViewResult> {

        const profile = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                candidate: {
                    select: candidateProfileSelect
                },
                recruiter: {
                    select: recruiterSelect
                }
            }
        });

        if (!profile) {
            throw new NotFoundError("User not found.");
        }

        return {
            profile: profile.candidate ?? profile.recruiter ?? null
        };
    }

    static async updateUserLastLogin(userId: string, lastLoginAt: Date) {
        return prisma.user.update({
            where: { id: userId },
            data: {
                lastLoginAt: lastLoginAt,
            }
        })
    }

    static async updateUserPassword(userId: string, newPassword: string) {
        return prisma.user.update({
            where: { id: userId },
            data: {
                password: newPassword,
            }
        })
    }

    static async findRefreshToken(token: string) {
        return prisma.refreshToken.findUnique({
            where: { token },
            select: {
                token: true,
                userId: true,
                expiresAt: true,
            }
        })
    }

    static async deleteRefreshToken(token: string) {
        return prisma.refreshToken.delete({
            where: {
                token
            }
        });

    }


    static async calcLoggedinDevices(userId: string) {
        const user = await AuthRepository.findUserById(userId);
        if (!user) {
            throw new NotFoundError("User not found.");
        }

        const count = await prisma.refreshToken.count({
            where: {
                userId: userId
            }
        });
        return count;
    }

    static async deleteAllRefreshTokensForUser(userId: string) {
        return prisma.refreshToken.deleteMany({
            where: {
                userId
            }
        });
    }

    static async saveOTP(
        userId: string, 
        otp: string,
        otpExpiresAt: Date
    ) {
        return prisma.user.update({
            where: {
                id: userId
            },
            data:{
                otp: otp,
                otpExpiresAt: otpExpiresAt
            }
        });
    }

    static async createCandidateRegistration(
        data: RegisterCandidateInput
    ): Promise<{ user: AuthUserView; candidate: CandidateRegistrationView }> {
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
                    fullName: data.fullName
                },
                select: candidateSelect,
            });

            return { user, candidate };
        });
    }

    static async findCompanyById(companyId: string): Promise<RecruiterCompanyView | null> {
        return prisma.company.findUnique({
            where: { id: companyId },
            select: companySelect,
        });
    }

    static async createCompany(
        companyInput: RecruiterCompanyInput
    ): Promise<RecruiterCompanyView> {
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

    static async createRecruiterRegistration(
        data: RegisterRecruiterInput
    ): Promise<{
        user: AuthUserView;
        company: RecruiterCompanyView;
        recruiter: RecruiterProfileView;
    }> {
        return prisma.$transaction(async (tx) => {
            let company: RecruiterCompanyView | null = null;

            if (data.companyId) {
                company = await tx.company.findUnique({
                    where: { id: data.companyId },
                    select: companySelect,
                });

                if (!company) {
                    throw new NotFoundError("Company not found.");
                }
            } else if (data.company) {
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

    static async saveRefreshToken(data: {
        token: string;
        userId: string;
        expiresAt: Date;
    }) {
        return prisma.refreshToken.create({
            data,
        });
    }
}