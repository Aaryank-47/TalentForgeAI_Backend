import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { AUTH_CONSTANTS } from "../constants/auth.constants.js";
import type { RegisterCandidateDto } from "../dto/Candidate.dto.js";
import type { RegisterRecruiterDto } from "../dto/registerRecruiter.dto.js";
import { AuthRepository } from "../repositories/auth.repository.js";
import { buildAuthTokens, getRefreshTokenExpiresAt } from "../utils/auth.utils.js";
import type { RegisterCandidateResult, RegisterRecruiterResult, LoginResult, CandidateLoginProfileView, RecruiterLoginProfileView } from "../interfaces/auth.interface.js";
import type { LoginDto } from "../dto/Candidate.dto.js"
import { UserRole, AccountStatus } from "../../../common/enums/all_enums.js"
import type { AuthTokens } from "../interfaces/auth.interface.js"
import { JwtHelper } from "../../../common/helper/jwt.helper.js";
import { UnauthorizedError } from "../../../common/errors/UnauthorizedError.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import type { LogoutAllDevicesDto } from "../dto/Candidate.dto.js";


const isUniqueConstraintError = (error: unknown): boolean => {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
};

export class AuthService {
    static async registerCandidate(
        payload: RegisterCandidateDto
    ): Promise<RegisterCandidateResult> {
        const existingUser = await AuthRepository.findUserByEmail(payload.email);

        if (existingUser) {
            throw new ConflictError("An account with this email already exists.");
        }

        const hashedPassword = await bcrypt.hash(
            payload.password,
            AUTH_CONSTANTS.PASSWORD_SALT_ROUNDS
        );

        try {
            const registration = await AuthRepository.createCandidateRegistration({
                ...payload,
                password: hashedPassword,
            });

            const tokens = buildAuthTokens({
                id: registration.user.id,
                email: registration.user.email,
                role: registration.user.role,
            });

            await AuthRepository.saveRefreshToken({
                token: tokens.refreshToken,
                userId: registration.user.id,
                expiresAt: getRefreshTokenExpiresAt(tokens.refreshToken),
            });

            return {
                ...registration,
                tokens,
            };
        } catch (error) {
            if (isUniqueConstraintError(error)) {
                throw new ConflictError("An account with this email already exists.");
            }

            throw error;
        }
    }

    static async login(
        payload: LoginDto
    ): Promise<LoginResult> {
        const user = await AuthRepository.findLoginUserByEmail(payload.email);

        if (!user) {
            throw new ConflictError("Invalid email or password.");
        }

        const isPassowrdValid = await bcrypt.compare(payload.password, user.password);

        if (!isPassowrdValid) {
            throw new ConflictError("Invalid email or password.");
        }

        switch (user.status) {
            case AccountStatus.PENDING:
                throw new ConflictError("Your account is pending approval. Please wait for an administrator to approve your account.");
            case AccountStatus.INACTIVE:
                throw new ConflictError("Your account is not active. Please contact support.");
            case AccountStatus.SUSPENDED:
                throw new ConflictError("Your account has been suspended. Please contact support.");
            case AccountStatus.BLOCKED:
                throw new ConflictError("Your account has been blocked. Please contact support.");
            case AccountStatus.ACTIVE:
                break;
        }

        const loggedInDevicesCount = await AuthRepository.calcLoggedinDevices(user.id);
        console.log("loggedInDevicesCount", loggedInDevicesCount);
        if (loggedInDevicesCount >= AUTH_CONSTANTS.Device_Limit) {
            throw new ConflictError(`You have reached the maximum number of logged-in devices (${AUTH_CONSTANTS.Device_Limit}). Please log out from another device before logging in again.`);
        }

        const tokens = buildAuthTokens({
            id: user.id,
            email: user.email,
            role: user.role,
            companyId: user.recruiter?.companyId,
        });

        await AuthRepository.saveRefreshToken({
            token: tokens.refreshToken,
            userId: user.id,
            expiresAt: getRefreshTokenExpiresAt(tokens.refreshToken),
        });

        await AuthRepository.updateUserLastLogin(user.id, new Date());

        let profile: CandidateLoginProfileView | RecruiterLoginProfileView | null = null;

        if (user.candidate) {
            profile = user.candidate as CandidateLoginProfileView;
        } else if (user.recruiter) {
            profile = user.recruiter as RecruiterLoginProfileView;
        }

        const {
            password,
            ...authUser
        } = user;

        return {
            user: authUser,
            profile,
            tokens,
        };
    }

    static async newRefreshToken(
        refreshToken: string
    ):Promise<AuthTokens> {
        const verifiedToken = JwtHelper.verifyRefreshToken(refreshToken);
        if(!verifiedToken) {
            throw new ConflictError("Invalid refresh token.");
        }

        const storedToken = await AuthRepository.findRefreshToken(refreshToken);
        // console.log("storedToken", storedToken);
        if(!storedToken) {
            throw new ConflictError("Refresh token not found.");
        }

        if(storedToken.expiresAt < new Date()){
            throw new UnauthorizedError("Refresh token has expired.");
        }

        const user = await AuthRepository.findUserById(storedToken.userId);
        if(!user) {
            throw new ConflictError("User not found.");
        }

        await AuthRepository.deleteRefreshToken(refreshToken);

        const tokens = buildAuthTokens({
            id: user.id,
            email: user.email,
            role: user.role
        });

        return tokens;
    }

    static async logout(
        refreshToken: string
    ):Promise<void>{
        const storedToken = await AuthRepository.findRefreshToken(refreshToken);
        if(!storedToken){
            throw new ConflictError("Refresh token not found.");
        }
        await AuthRepository.deleteRefreshToken(refreshToken);

        return;
    }

    static async logoutAllDevices(
        userId: string
    ): Promise<void> {
        const user = await AuthRepository.findUserById(userId);
        if (!user) {
            throw new NotFoundError("User not found.");
        }

        await AuthRepository.deleteAllRefreshTokensForUser(userId);
        return;
    }

    static async logoutAllDevicesByEmail(
        payload: LogoutAllDevicesDto
    ):Promise<void>{
        const user = await AuthRepository.findLoginUserByEmail(payload.email);
        if(!user){
            throw new NotFoundError("User not found.");
        }

        const isPassowrdValid = await bcrypt.compare(payload.password, user.password);

        if (!isPassowrdValid) {
            throw new UnauthorizedError("Invalid email or password.");
        }

        await AuthRepository.deleteAllRefreshTokensForUser(user.id);
        return; 
    }


    static async registerRecruiter(
        payload: RegisterRecruiterDto
    ): Promise<RegisterRecruiterResult> {
        const existingUser = await AuthRepository.findUserByEmail(payload.email);

        if (existingUser) {
            throw new ConflictError("An account with this email already exists.");
        }

        const hashedPassword = await bcrypt.hash(
            payload.password,
            AUTH_CONSTANTS.PASSWORD_SALT_ROUNDS
        );

        try {
            const registration = await AuthRepository.createRecruiterRegistration({
                ...payload,
                password: hashedPassword,
            });

            const tokens = buildAuthTokens({
                id: registration.user.id,
                email: registration.user.email,
                role: registration.user.role,
                companyId: registration.company.id,
            });

            await AuthRepository.saveRefreshToken({
                token: tokens.refreshToken,
                userId: registration.user.id,
                expiresAt: getRefreshTokenExpiresAt(tokens.refreshToken),
            });

            return {
                ...registration,
                tokens,
            };
        } catch (error) {
            if (isUniqueConstraintError(error)) {
                throw new ConflictError("An account with this email already exists.");
            }

            throw error;
        }
    }
}