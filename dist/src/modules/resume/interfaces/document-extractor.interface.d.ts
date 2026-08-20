export interface DocumentExtractionResult {
    text: string;
    wordCount: number;
    pageCount?: number;
}
export interface DocumentExtractor {
    extract(documentBuffer: Buffer): Promise<DocumentExtractionResult>;
}
//# sourceMappingURL=document-extractor.interface.d.ts.map