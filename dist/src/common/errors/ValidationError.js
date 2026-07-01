import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ApiError } from './ApiError.js';
export class ValidationError extends ApiError {
    constructor(message = "Validation Error", errors) {
        super(HTTP_STATUS.BAD_REQUEST, message, errors);
    }
}
//# sourceMappingURL=ValidationError.js.map