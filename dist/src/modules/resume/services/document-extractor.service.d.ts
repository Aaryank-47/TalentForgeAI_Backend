import type { DocumentExtractionResult } from "../interfaces/document-extractor.interface.js";
export declare class DocumentExtractorService {
    extractDocument(documentBuffer: Buffer, mimeType: string): Promise<DocumentExtractionResult>;
    extractPdf(documentBuffer: Buffer): Promise<DocumentExtractionResult>;
    extractDocx(documentBuffer: Buffer): Promise<DocumentExtractionResult>;
}
//# sourceMappingURL=document-extractor.service.d.ts.map