import { ApiError } from "./ApiError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js"

export class ConflictError extends ApiError {
    constructor(
        message = "Conflict",
        errors?: unknown
    ) {
        super(HTTP_STATUS.CONFLICT, message, errors);
    }
}