import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { AUTH_CONSTANTS } from "../constants/auth.constants.js";
import type {
    RegisterCandidateDto,
} from "../dto/registerCandidate.dto.js";
import type { RegisterRecruiterDto } from "../dto/registerRecruiter.dto.js";
import { AuthRepository } from "../repositories/auth.repository.js";
import { buildAuthTokens, getRefreshTokenExpiresAt } from "../utils/auth.utils.js";
import type {
    RegisterCandidateResult,
    RegisterRecruiterResult,
} from "../interfaces/auth.interface.js";

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