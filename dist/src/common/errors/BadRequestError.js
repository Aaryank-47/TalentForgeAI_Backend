import { ApiError } from "./ApiError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
export class BadRequestError extends ApiError {
    constructor(message = "Bad Request", errors) {
        super(HTTP_STATUS.BAD_REQUEST, message, errors);
    }
}
//# sourceMappingURL=BadRequestError.js.map