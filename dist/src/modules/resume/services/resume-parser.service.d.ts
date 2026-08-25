import type { ResumeParsingResult } from "../interfaces/resume-parser.interface.js";
export declare class ResumeParserService {
    private readonly documentExtractorService;
    parseResumeText(resumeText: string): Promise<ResumeParsingResult>;
    parseResumeDocument(documentBuffer: Buffer, mimeType: string): Promise<ResumeParsingResult>;
    parseResumeDocumentWithFallback(documentBuffer: Buffer, mimeType: string): Promise<ResumeParsingResult>;
    processParsingResponse(aiResponseContent: string): Promise<ResumeParsingResult>;
    /**
     * Sanitizes AI response before final schema validation:
     * - Trims strings
     * - Normalizes placeholder strings ("N/A", "NA", "none", "not specified", "unknown", "") to null for optional scalar fields
     * - Safely filters out isolated unrecoverable array entries (e.g. malformed null or non-object items in skills/experience/education)
     *   while preserving structural strictness if an entire section is of the wrong data type.
     */
    private sanitizeAiResponse;
    private extractJsonString;
}
//# sourceMappingURL=resume-parser.service.d.ts.map