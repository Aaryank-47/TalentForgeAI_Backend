import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { logger } from "../../../common/logger/logger.js";
import { RESUME_MIME_TYPES } from "../constants/resume.constants.js";
import { DocumentExtractionError, EmptyDocumentTextError, ScannedPdfDetectedError, UnsupportedFileTypeError } from "../errors/document-extraction.errors.js";
import { calculateWordCount, cleanExtractedText } from "../utils/document-extraction.utils.js";
export class DocumentExtractorService {
    async extractDocument(documentBuffer, mimeType) {
        if (!documentBuffer) {
            throw new DocumentExtractionError("Document buffer is required");
        }
        if (documentBuffer.length === 0) {
            throw new DocumentExtractionError("Document buffer cannot be empty");
        }
        if (!mimeType || mimeType.trim().length === 0) {
            throw new UnsupportedFileTypeError("unknown");
        }
        const normalizedMimeType = mimeType.trim().toLowerCase();
        switch (normalizedMimeType) {
            case RESUME_MIME_TYPES.PDF:
                return this.extractPdf(documentBuffer);
            case RESUME_MIME_TYPES.DOCX:
                return this.extractDocx(documentBuffer);
            default:
                throw new UnsupportedFileTypeError(normalizedMimeType);
        }
    }
    async extractPdf(documentBuffer) {
        if (!documentBuffer || documentBuffer.length === 0) {
            throw new DocumentExtractionError("PDF document buffer cannot be empty");
        }
        logger.info("[DocumentExtractorService] Starting PDF text extraction...");
        const uint8Array = new Uint8Array(documentBuffer.buffer, documentBuffer.byteOffset, documentBuffer.byteLength);
        let parser;
        let extractedRawText = "";
        let pageCount;
        try {
            parser = new PDFParse(uint8Array);
            const textResult = await parser.getText();
            extractedRawText = textResult.text || "";
            pageCount = textResult.total ?? textResult.pages?.length ?? undefined;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unknown PDF parsing error";
            throw new DocumentExtractionError(`Failed to extract text from PDF document: ${message}`, error);
        }
        finally {
            if (parser) {
                try {
                    await parser.destroy();
                }
                catch {
                    // Ignore background cleanup errors
                }
            }
        }
        const cleanedText = cleanExtractedText(extractedRawText);
        const wordCount = calculateWordCount(cleanedText);
        if (cleanedText.length === 0 || wordCount === 0) {
            if (pageCount && pageCount > 0) {
                throw new ScannedPdfDetectedError();
            }
            throw new EmptyDocumentTextError("PDF document");
        }
        logger.info(`[DocumentExtractorService] PDF text extraction completed. Word count: ${wordCount}, Page count: ${pageCount ?? "unknown"}`);
        return {
            text: cleanedText,
            wordCount,
            ...(pageCount !== undefined && { pageCount })
        };
    }
    async extractDocx(documentBuffer) {
        if (!documentBuffer || documentBuffer.length === 0) {
            throw new DocumentExtractionError("DOCX document buffer cannot be empty");
        }
        logger.info("[DocumentExtractorService] Starting DOCX text extraction...");
        let result;
        try {
            result = await mammoth.extractRawText({ buffer: documentBuffer });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unknown DOCX parsing error";
            throw new DocumentExtractionError(`Failed to extract text from DOCX document: ${message}`, error);
        }
        const cleanedText = cleanExtractedText(result.value);
        const wordCount = calculateWordCount(cleanedText);
        if (cleanedText.length === 0 || wordCount === 0) {
            throw new EmptyDocumentTextError("DOCX document");
        }
        logger.info(`[DocumentExtractorService] DOCX text extraction completed. Word count: ${wordCount}`);
        return {
            text: cleanedText,
            wordCount
        };
    }
}
//# sourceMappingURL=document-extractor.service.js.map