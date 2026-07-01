import { HTTP_STATUS } from '../constants/httpStatus.js';
import {ApiError} from './ApiError.js';

export class ForbiddenError extends ApiError {
    constructor(
        message: string = "Forbidden",
        errors?: unknown
    ) {
        super(HTTP_STATUS.FORBIDDEN, message, errors);
    }
}
        