import { ApiError } from "./ApiError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
export class ConflictError extends ApiError {
    constructor(message = "Conflict", errors) {
        super(HTTP_STATUS.CONFLICT, message, errors);
    }
}
//# sourceMappingURL=ConflictError.js.map