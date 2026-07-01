import { ApiError } from "./ApiError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js"

export class UnauthorizedError extends ApiError {
    constructor(
        message: string = "Unauthorized",
        errors?: unknown
    ) {
        super(HTTP_STATUS.UNAUTHORIZED, message, errors);
    }
}