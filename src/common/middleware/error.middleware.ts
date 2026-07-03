import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errors/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { MESSAGE } from '../constants/messages.js';

export const errorMiddleware = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (err instanceof ApiError) {
        console.error("ApiError: ", err);
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors || null
        });
        return;
    }

    console.error("Unexpected error:  ", err);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGE.SERVER_ERROR,
        errors: null
    });
}