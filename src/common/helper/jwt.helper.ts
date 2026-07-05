import jwt from "jsonwebtoken";
import type { Secret, SignOptions, JwtPayload as JwtDefaultPayload } from "jsonwebtoken";
import type { JwtPayload } from "../types/types.js";
import env from "../../config/env.js";

export class JwtHelper {
    static generateAccessToken(payload: JwtPayload): string {
        return jwt.sign(
            payload,
            env.jwt.accessSecret as Secret,
            { 
                expiresIn: env.jwt.accessExpiresIn
            } as SignOptions
        )
    }

    static generateRefreshToken(payload: JwtPayload): string {
        return jwt.sign(
            payload,
            env.jwt.refreshSecret as Secret,
            { 
                expiresIn: env.jwt.refreshExpiresIn
            } as SignOptions
        )
    }

    static verifyAccessToken(token: string): JwtPayload {
        return jwt.verify(
            token,
            env.jwt.accessSecret as Secret
        ) as JwtPayload
    }

    static verifyRefreshToken(token: string) :JwtPayload {
        return jwt.verify(
            token,
            env.jwt.refreshSecret as Secret
        ) as JwtPayload
    }
    
    static decodeToken(token: string): JwtPayload {
        return jwt.decode (token) as JwtPayload
    }

    static generateResetPasswordToken(payload: JwtPayload): string {
        return jwt.sign(
            payload,
            env.jwt.resetPasswordSecret as Secret,
            { 
                expiresIn: env.jwt.resetPasswordExpiresIn
            } as SignOptions
        )
    }

    static verifyResetPasswordToken(token: string): JwtPayload {
        return jwt.verify(
            token,
            env.jwt.resetPasswordSecret as Secret
        ) as JwtPayload
    }
}