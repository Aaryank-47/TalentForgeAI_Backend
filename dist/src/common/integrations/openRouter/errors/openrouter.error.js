export class OpenRouterError extends Error {
    statusCode;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = "OpenRouterError";
    }
}
//# sourceMappingURL=openrouter.error.js.map