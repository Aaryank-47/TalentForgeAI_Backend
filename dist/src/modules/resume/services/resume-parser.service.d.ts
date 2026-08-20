import type { ResumeParsingResult } from "../interfaces/resume-parser.interface.js";
export declare class ResumeParserService {
    private readonly documentExtractorService;
    private readonly resumeNormalizationService;
    parseResumeText(resumeText: string): Promise<ResumeParsingResult>;
    parseResumeDocument(documentBuffer: Buffer, mimeType: string): Promise<ResumeParsingResult>;
    parseResumeDocumentWithFallback(documentBuffer: Buffer, mimeType: string): Promise<ResumeParsingResult>;
    private processParsingResponse;
    private extractJsonString;
}
//# sourceMappingURL=resume-parser.service.d.ts.map