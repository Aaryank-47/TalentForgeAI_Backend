import { BadRequestError } from "./BadRequestError.js";
export declare class AIProcessingError extends BadRequestError {
    readonly code: string;
    constructor(message?: string, code?: string);
}
//# sourceMappingURL=AIProcessingError.d.ts.map