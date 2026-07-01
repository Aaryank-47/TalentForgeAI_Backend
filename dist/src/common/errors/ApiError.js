export class ApiError extends Error {
    statusCode;
    success;
    errors;
    constructor(statusCode, message, errors) {
        super(message);
        this.statusCode = statusCode;
        this.success = false;
        this.errors = errors;
        Error.captureStackTrace(this, this.constructor);
    }
}
//# sourceMappingURL=ApiError.js.map