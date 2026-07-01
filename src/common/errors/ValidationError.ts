import { HTTP_STATUS } from '../constants/httpStatus.js';
import {ApiError} from './ApiError.js';

export class ValidationError extends ApiError {
    constructor(
        message: string = "Validation Error",
        errors?: unknown
    ) {
        super(HTTP_STATUS.BAD_REQUEST, message, errors);
    }
}