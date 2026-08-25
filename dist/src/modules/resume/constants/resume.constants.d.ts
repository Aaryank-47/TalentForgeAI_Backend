export declare const RESUME_MIME_TYPES: {
    readonly PDF: "application/pdf";
    readonly DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    readonly PNG: "image/png";
    readonly JPEG: "image/jpeg";
    readonly WEBP: "image/webp";
};
export declare const EXTRACTION_SUPPORTED_MIME_TYPES: readonly ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
export type ExtractionSupportedMimeType = typeof EXTRACTION_SUPPORTED_MIME_TYPES[number];
export declare const DIRECT_AI_SUPPORTED_MIME_TYPES: readonly ["application/pdf", "image/png", "image/jpeg", "image/webp"];
export type DirectAiSupportedMimeType = typeof DIRECT_AI_SUPPORTED_MIME_TYPES[number];
export declare const DOCUMENT_TYPE: {
    readonly PDF: "PDF";
    readonly DOCX: "DOCX";
};
export type DocumentType = typeof DOCUMENT_TYPE[keyof typeof DOCUMENT_TYPE];
import type { ResumeProcessingStage } from "../queues/resume-processing.types.js";
export declare const STAGE_PROGRESS_PERCENTAGES: Record<ResumeProcessingStage, number>;
export declare const PROCESSING_STATE_TTL_SECONDS = 3600;
//# sourceMappingURL=resume.constants.d.ts.map