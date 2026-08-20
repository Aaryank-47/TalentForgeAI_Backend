export class UnsupportedFileTypeError extends Error {
    constructor(mimeType: string) {
        super(`Unsupported resume document type: "${mimeType}". Supported file types are PDF and DOCX.`);
        this.name = "UnsupportedFileTypeError";
    }
}

export class DocumentExtractionError extends Error {
    constructor(message: string, public readonly cause?: unknown) {
        super(message.startsWith("Failed to extract text") ? message : `Failed to extract text from document: ${message}`);
        this.name = "DocumentExtractionError";
    }
}

export class EmptyDocumentTextError extends Error {
    constructor(documentType = "Document") {
        super(`${documentType} contains no extractable text.`);
        this.name = "EmptyDocumentTextError";
    }
}

export class ScannedPdfDetectedError extends Error {
    constructor() {
        super("PDF appears to contain scanned/image-only content and no extractable text was found.");
        this.name = "ScannedPdfDetectedError";
    }
}
