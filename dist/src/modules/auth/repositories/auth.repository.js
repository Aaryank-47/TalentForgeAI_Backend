import { AccountStatus, UserRole, CompanyMemberRole } from "@prisma/client";
import prisma from "../../../config/database.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { createUniqueSlugSeed } from "../utils/auth.utils.js";
import { userSelect, loginUserSelect } from "../../../common/prisma.select/user.select.js";
import { candidateSelect, candidateProfileSelect } from "../../../common/prisma.select/candidate.select.js";
import { companySelect } from "../../../common/prisma.select/company.select.js";
import { employerSelect } from "../../../common/prisma.select/employer.select.js";
const nullableString = (value) => value ?? null;
const nullableNumber = (value) => value ?? null;
export class AuthRepository {
    static async findUserByEmail(email) {
        // console.log("Finding user by email inside auth repository:", email);
        return prisma.user.findUnique({
            where: { email },
            select: userSelect,
        });
    }
    static async findLoginUserByEmail(email) {
        return prisma.user.findUnique({
            where: { email },
            select: loginUserSelect,
        });
    }
    static async findUserById(userId) {
        return prisma.user.findUnique({
            where: { id: userId },
            select: userSelect,
        });
    }
    static async findUserWithPasswordById(userId) {
        return prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                password: true,
            },
        });
    }
    static async findProfileByUserId(userId) {
        const profile = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                candidate: {
                    select: candidateProfileSelect
                },
                employer: {
                    select: employerSelect
                }
            }
        });
        if (!profile) {
            throw new NotFoundError("User not found.");
        }
        return {
            profile: profile.candidate ?? profile.employer ?? null
        };
    }
    static async updateUserLastLogin(userId, lastLoginAt) {
        return prisma.user.update({
            where: { id: userId },
            data: {
                lastLoginAt: lastLoginAt,
            }
        });
    }
    static async updateUserPassword(userId, newPassword) {
        return prisma.user.update({
            where: { id: userId },
            data: {
                password: newPassword,
            }
        });
    }
    static async findRefreshToken(token) {
        return prisma.refreshToken.findUnique({
            where: { token },
            select: {
                token: true,
                userId: true,
                expiresAt: true,
            }
        });
    }
    static async deleteRefreshToken(token) {
        return prisma.refreshToken.delete({
            where: {
                token
            }
        });
    }
    static async calcLoggedinDevices(userId) {
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
    static async deleteAllRefreshTokensForUser(userId) {
        return prisma.refreshToken.deleteMany({
            where: {
                userId
            }
        });
    }
    static async saveOTP(userId, otp, otpExpiresAt) {
        return prisma.user.update({
            where: {
                id: userId
            },
            data: {
                otp: otp,
                otpExpiresAt: otpExpiresAt
            }
        });
    }
    static async findOTPByUserId(userId) {
        return prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                otp: true,
                otpExpiresAt: true
            }
        });
    }
    static async deleteOtpForUser(userId) {
        return prisma.user.update({
            where: {
                id: userId
            },
            data: {
                otp: null,
                otpExpiresAt: null
            }
        });
    }
    static async markEmailVerified(userId) {
        return prisma.user.update({
            where: { id: userId },
            data: { isEmailVerified: true },
        });
    }
    static async saveResetPasswordToken(userId, resetPasswordToken, resetPasswordTokenExpiresAt) {
        // console.log("Saving reset password token for user:", userId, "Token:", resetPasswordToken, "Expires At:", resetPasswordTokenExpiresAt);
        return prisma.user.update({
            where: {
                id: userId
            },
            data: {
                resetPasswordToken: resetPasswordToken,
                resetPasswordTokenExpiresAt: resetPasswordTokenExpiresAt
            }
        });
    }
    static async findResetPasswordTokenByUserId(userId) {
        return prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                resetPasswordToken: true,
                resetPasswordTokenExpiresAt: true
            }
        });
    }
    static async deleteResetPasswordTokenForUser(userId) {
        return prisma.user.update({
            where: {
                id: userId
            },
            data: {
                resetPasswordToken: null,
                resetPasswordTokenExpiresAt: null
            }
        });
    }
    static async updateNewPasswordForUser(userId, newPassword) {
        await prisma.user.update({
            where: { id: userId },
            data: { password: newPassword },
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
                    fullName: data.fullName
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
            const baseSlug = createUniqueSlugSeed(companyInput.slug ?? companyInput.companyName);
            let slug = baseSlug;
            let suffix = 1;
            while (await tx.company.findUnique({ where: { slug } })) {
                slug = `${baseSlug}-${suffix}`;
                suffix += 1;
            }
            return tx.company.create({
                data: {
                    companyName: companyInput.companyName,
                    slug,
                    companyEmail: nullableString(companyInput.email),
                    phoneNumber: nullableString(companyInput.phoneNumber),
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
    static async createEmployerRegistration(data) {
        return prisma.$transaction(async (tx) => {
            const company = await tx.company.findUnique({
                where: { id: data.companyId },
                select: { id: true },
            });
            if (!company) {
                throw new NotFoundError("Company not found.");
            }
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    password: data.password,
                    role: UserRole.EMPLOYER,
                    status: AccountStatus.ACTIVE,
                    isEmailVerified: false,
                },
                select: userSelect,
            });
            const employer = await tx.employer.create({
                data: {
                    userId: user.id,
                    fullName: data.fullName,
                },
                select: employerSelect,
            });
            await tx.companyMember.create({
                data: {
                    userId: user.id,
                    companyId: data.companyId,
                    role: CompanyMemberRole.RECRUITER,
                }
            });
            return { user, employer };
        });
    }
    static async createCompanyOwnerRegistration(data) {
        return prisma.$transaction(async (tx) => {
            const baseSlug = createUniqueSlugSeed(data.company.slug ?? data.company.companyName);
            let slug = baseSlug;
            let suffix = 1;
            while (await tx.company.findUnique({ where: { slug } })) {
                slug = `${baseSlug}-${suffix}`;
                suffix += 1;
            }
            const company = await tx.company.create({
                data: {
                    companyName: data.company.companyName,
                    slug,
                    companyEmail: nullableString(data.company.email),
                    phoneNumber: nullableString(data.company.phoneNumber),
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
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    password: data.password,
                    role: UserRole.EMPLOYER,
                    status: AccountStatus.ACTIVE,
                    isEmailVerified: false,
                },
                select: userSelect,
            });
            const employer = await tx.employer.create({
                data: {
                    userId: user.id,
                    fullName: data.fullName,
                },
                select: employerSelect,
            });
            await tx.companyMember.create({
                data: {
                    userId: user.id,
                    companyId: company.id,
                    role: CompanyMemberRole.OWNER,
                }
            });
            return { user, company, employer };
        });
    }
    static async saveRefreshToken(data) {
        return prisma.refreshToken.create({
            data,
        });
    }
}
//# sourceMappingURL=auth.repository.js.map