import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { AUTH_CONSTANTS } from "../constants/auth.constants.js";
import type { RegisterCandidateDto, VerifyOtpDto, VerifyEmailDto, ResendVerificationDto } from "../dto/Candidate.dto.js";
import type { RegisterRecruiterDto } from "../dto/registerRecruiter.dto.js";
import type { RegisterCompanyOwnerDto } from "../dto/registerCompanyOwner.dto.js";
import { AuthRepository } from "../repositories/auth.repository.js";
import { buildAuthTokens, getRefreshTokenExpiresAt, genrateOTP } from "../utils/auth.utils.js";
import type { RegisterCandidateResult, RegisterRecruiterResult, RegisterCompanyOwnerResult, LoginResult, CandidateLoginProfileView, RecruiterLoginProfileView } from "../interfaces/auth.interface.js";
import type { LoginDto } from "../dto/Candidate.dto.js"
import { AccountStatus } from "../../../common/enums/all_enums.js"
import type { AuthTokens } from "../interfaces/auth.interface.js"
import { JwtHelper } from "../../../common/helper/jwt.helper.js";
import { UnauthorizedError } from "../../../common/errors/UnauthorizedError.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import type { LogoutAllDevicesDto } from "../dto/Candidate.dto.js";
import type { ProfileResult } from "../interfaces/auth.interface.js";
import { emailTemplates } from "../../../common/email/email.templates.js";
import { EmailService } from "../../../common/email/email.service.js";
import { getResetPasswordTokenExpiresAt} from "../utils/auth.utils.js"
import { MESSAGE } from "../../../common/constants/messages.js";



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
        // console.log("loggedInDevicesCount", loggedInDevicesCount);
        if (loggedInDevicesCount >= AUTH_CONSTANTS.Device_Limit) {
            throw new ConflictError(`You have reached the maximum number of logged-in devices (${AUTH_CONSTANTS.Device_Limit}). Please log out from another device before logging in again.`);
        }

        const tokens = buildAuthTokens({
            id: user.id,
            email: user.email,
            role: user.role,
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

    static async getMe(
        userId: string
    ): Promise<ProfileResult> {
        const user = await AuthRepository.findUserById(userId);
        if (!user) {
            throw new NotFoundError("User not found.");
        }

        const profile = await AuthRepository.findProfileByUserId(userId);

        return {
            user,
            profile: profile.profile
        };
    }

    static async changePassword(
        userId: string,
        oldPassword: string,
        newPassword: string
    ): Promise<void> {
        const user = await AuthRepository.findUserWithPasswordById(userId);
        if (!user) {
            throw new NotFoundError("User not found.");
        }

        const isPassowrdValid = await bcrypt.compare(oldPassword, user.password);

        if (!isPassowrdValid) {
            throw new UnauthorizedError("Invalid old password.");
        }

        const hashedPassword = await bcrypt.hash(
            newPassword,
            AUTH_CONSTANTS.PASSWORD_SALT_ROUNDS
        );

        await AuthRepository.updateUserPassword(userId, hashedPassword);
        await AuthRepository.deleteAllRefreshTokensForUser(user.id);

        return; 
    }
    

    static async forgotPassword(
        email: string
    ):Promise<void>{
        const user = await AuthRepository.findUserByEmail(email);
        if(!user){
            throw new NotFoundError("User not found.");
        }
        
        const otp = genrateOTP();
        console.log("Generated OTP:", otp);
        const hashOtp = await bcrypt.hash(
            otp,
            AUTH_CONSTANTS.OTP_HASH_SALT_ROUNDS
        )

        await AuthRepository.saveOTP(
            user.id,
            hashOtp,
            new Date(Date.now() + AUTH_CONSTANTS.OTP_EXPIRY)
        );

        const template = await emailTemplates.forgotPasswordOtpTemplate(otp);

        await EmailService.sendEmail({
            to: user.email,
            ...template
        })

        return;
    }

    static async verifyOtp(
        payload: VerifyOtpDto
    ):Promise<string>{
        const user = await AuthRepository.findUserByEmail(payload.email);
        if(!user){
            throw new NotFoundError("User not found.");
        }

        const storedOtp = await AuthRepository.findOTPByUserId(user.id);
        if(!storedOtp?.otp || !storedOtp?.otpExpiresAt) {
            throw new NotFoundError("OTP not found. Please request a new OTP.");
        }

        if(storedOtp.otpExpiresAt < new Date()){
            await AuthRepository.deleteOtpForUser(user.id);
            throw new UnauthorizedError("OTP has expired. Please request a new OTP.");
        }

        const isOtpValid = await bcrypt.compare(payload.otp, storedOtp.otp);
        if(!isOtpValid){
            throw new UnauthorizedError("Invalid OTP. Please try again.");
        }   

        await AuthRepository.deleteOtpForUser(user.id);

        const resetPasswordToken = JwtHelper.generateResetPasswordToken({
            id: user.id,
            email: user.email,
            role: user.role
        });
        
        await AuthRepository.saveResetPasswordToken(
            user.id,
            resetPasswordToken,
            getResetPasswordTokenExpiresAt(resetPasswordToken)
        );


        return resetPasswordToken;
    }

    static async resetPassword(
        resetPasswordToken: string,
        newPassword: string
    ):Promise<void>{
        const decodedToken = JwtHelper.verifyResetPasswordToken(resetPasswordToken);
        if(!decodedToken){
            throw new UnauthorizedError("Invalid reset password token.");
        }

        const storedToken = await AuthRepository.findResetPasswordTokenByUserId(decodedToken.id);
        if(!storedToken || storedToken.resetPasswordToken !== resetPasswordToken){
            throw new UnauthorizedError("Reset password token not found.");
        }

        if(getResetPasswordTokenExpiresAt(resetPasswordToken) < new Date()){
            await AuthRepository.deleteResetPasswordTokenForUser(decodedToken.id);
            throw new UnauthorizedError("Reset password token has expired.");
        }

        const hanshNewPassword = await bcrypt.hash(
            newPassword,
            AUTH_CONSTANTS.PASSWORD_SALT_ROUNDS
        );

        await AuthRepository.updateUserPassword(decodedToken.id, hanshNewPassword);
        await AuthRepository.deleteResetPasswordTokenForUser(decodedToken.id);
        await AuthRepository.deleteAllRefreshTokensForUser(decodedToken.id);
        
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

    static async registerCompanyOwner(
        payload: RegisterCompanyOwnerDto
    ): Promise<RegisterCompanyOwnerResult> {
        const existingUser = await AuthRepository.findUserByEmail(payload.email);

        if (existingUser) {
            throw new ConflictError("An account with this email already exists.");
        }

        const hashedPassword = await bcrypt.hash(
            payload.password,
            AUTH_CONSTANTS.PASSWORD_SALT_ROUNDS
        );

        try {
            const registration = await AuthRepository.createCompanyOwnerRegistration({
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

    static async verifyEmail(
        payload: VerifyEmailDto
    ): Promise<void> {
        const user = await AuthRepository.findUserByEmail(payload.email);
        if (!user) {
            throw new NotFoundError(MESSAGE.USER_NOT_FOUND);
        }

        const storedOtp = await AuthRepository.findOTPByUserId(user.id);
        if (!storedOtp?.otp || !storedOtp?.otpExpiresAt) {
            throw new NotFoundError("OTP not found. Please request a new OTP.");
        }

        if (storedOtp.otpExpiresAt < new Date()) {
            await AuthRepository.deleteOtpForUser(user.id);
            throw new UnauthorizedError("OTP has expired. Please request a new OTP.");
        }

        const isOtpValid = await bcrypt.compare(payload.otp, storedOtp.otp);
        if (!isOtpValid) {
            throw new UnauthorizedError("Invalid OTP. Please try again.");
        }

        await AuthRepository.deleteOtpForUser(user.id);
        await AuthRepository.markEmailVerified(user.id);
    }

    static async resendVerificationEmail(
        payload: ResendVerificationDto
    ): Promise<void> {
        const user = await AuthRepository.findUserByEmail(payload.email);
        if (!user) {
            throw new NotFoundError(MESSAGE.USER_NOT_FOUND);
        }

        if (user.isEmailVerified) {
            throw new ConflictError(MESSAGE.EMAIL_ALREADY_VERIFIED);
        }

        await AuthRepository.deleteOtpForUser(user.id);

        const otp = genrateOTP();
        const hashedOtp = await bcrypt.hash(
            otp,
            AUTH_CONSTANTS.OTP_HASH_SALT_ROUNDS
        );

        await AuthRepository.saveOTP(
            user.id,
            hashedOtp,
            new Date(Date.now() + AUTH_CONSTANTS.EMAIL_VERIFICATION_OTP_EXPIRY)
        );

        const profile = await AuthRepository.findProfileByUserId(user.id);
        let name = "User";
        if (profile.profile && "fullName" in profile.profile) {
            name = profile.profile.fullName;
        } else if (profile.profile && "firstName" in profile.profile) {
            name = profile.profile.firstName;
        }

        const template = emailTemplates.verifyEmailOtpTemplate(otp, name);

        await EmailService.sendEmail({
            to: user.email,
            ...template
        });
    }
}