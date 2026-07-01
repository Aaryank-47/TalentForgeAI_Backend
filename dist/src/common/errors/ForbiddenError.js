import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ApiError } from './ApiError.js';
export class ForbiddenError extends ApiError {
    constructor(message = "Forbidden", errors) {
        super(HTTP_STATUS.FORBIDDEN, message, errors);
    }
}
//# sourceMappingURL=ForbiddenError.js.map