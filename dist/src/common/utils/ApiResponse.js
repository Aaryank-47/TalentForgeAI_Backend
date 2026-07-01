export class ApiResponse {
    success;
    message;
    data;
    constructor(success, message, data = null) {
        this.success = success;
        this.message = message;
        this.data = data;
    }
}
//# sourceMappingURL=ApiResponse.js.map