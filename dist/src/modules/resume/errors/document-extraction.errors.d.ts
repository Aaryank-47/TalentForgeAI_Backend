export declare class UnsupportedFileTypeError extends Error {
    constructor(mimeType: string);
}
export declare class DocumentExtractionError extends Error {
    readonly cause?: unknown | undefined;
    constructor(message: string, cause?: unknown | undefined);
}
export declare class EmptyDocumentTextError extends Error {
    constructor(documentType?: string);
}
export declare class ScannedPdfDetectedError extends Error {
    constructor();
}
//# sourceMappingURL=document-extraction.errors.d.ts.map