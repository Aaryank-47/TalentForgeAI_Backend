import { BadRequestError } from "./BadRequestError.js";

export class AIProcessingError extends BadRequestError {
    public readonly code: string;

    constructor(
        message = "We could not process your answer right now. Please try again.",
        code = "AI_PROCESSING_FAILED"
    ) {
        super(message);
        this.code = code;
    }
}
