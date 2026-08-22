import type {Request, Response, NextFunction} from 'express';
import { ApiError } from '../errors/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { MESSAGE } from '../constants/messages.js';
import { asyncHandler } from '../helper/asyncHandler.js';
import { JwtHelper } from '../helper/jwt.helper.js';

export type AuthenticatedUser = unknown;

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export const authMiddleware = asyncHandler(
    async (
        req: Request,
        res:Response,
        next: NextFunction
    ): Promise<void> =>{
        let accessToken = req.cookies?.accessToken;
        
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            accessToken = authHeader.substring(7);
        }

        if(!accessToken) {
            throw new ApiError(HTTP_STATUS.UNAUTHORIZED, MESSAGE.UNAUTHORIZED);
        }

        try {
            const decodedToken = await JwtHelper.verifyAccessToken(accessToken);
            (req as AuthenticatedRequest).user = decodedToken;
            next();
        
        } catch (error) {
            throw new ApiError(HTTP_STATUS.UNAUTHORIZED, MESSAGE.UNAUTHORIZED);
        }
    }
    
)