export declare class ApiError extends Error {
    readonly statusCode: number;
    readonly success: boolean;
    readonly errors?: unknown;
    constructor(statusCode: number, message: string, errors?: unknown);
}
//# sourceMappingURL=ApiError.d.ts.map