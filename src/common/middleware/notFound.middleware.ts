import type {Request, Response} from 'express';
import {HTTP_STATUS} from '../constants/httpStatus.js';

export const notFoundMiddleware = (
    req: Request,
    res: Response
): void =>{
    res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    })
}