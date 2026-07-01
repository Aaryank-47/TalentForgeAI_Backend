import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ApiError} from './ApiError.js';

export class NotFoundError extends ApiError {
    constructor (
        message: string = "Resource Not Found",
        errors?: unknown
    ) {
        super(HTTP_STATUS.NOT_FOUND, message, errors);
    }
}