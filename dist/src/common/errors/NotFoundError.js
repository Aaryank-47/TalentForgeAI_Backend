import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ApiError } from './ApiError.js';
export class NotFoundError extends ApiError {
    constructor(message = "Resource Not Found", errors) {
        super(HTTP_STATUS.NOT_FOUND, message, errors);
    }
}
//# sourceMappingURL=NotFoundError.js.map