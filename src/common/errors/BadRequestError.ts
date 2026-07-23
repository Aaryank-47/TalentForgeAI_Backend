import { ApiError } from "./ApiError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

export class BadRequestError extends ApiError {
    constructor(
        message = "Bad Request",
        errors?: unknown
    ) {
        super(HTTP_STATUS.BAD_REQUEST, message, errors);
    }
}
