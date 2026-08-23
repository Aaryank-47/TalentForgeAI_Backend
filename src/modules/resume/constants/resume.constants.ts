export const RESUME_MIME_TYPES = {
    PDF: "application/pdf",
    DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    PNG: "image/png",
    JPEG: "image/jpeg",
    WEBP: "image/webp"
} as const;

export const EXTRACTION_SUPPORTED_MIME_TYPES = [
    RESUME_MIME_TYPES.PDF,
    RESUME_MIME_TYPES.DOCX
] as const;

export type ExtractionSupportedMimeType = typeof EXTRACTION_SUPPORTED_MIME_TYPES[number];

export const DIRECT_AI_SUPPORTED_MIME_TYPES = [
    RESUME_MIME_TYPES.PDF,
    RESUME_MIME_TYPES.PNG,
    RESUME_MIME_TYPES.JPEG,
    RESUME_MIME_TYPES.WEBP
] as const;

export type DirectAiSupportedMimeType = typeof DIRECT_AI_SUPPORTED_MIME_TYPES[number];

export const DOCUMENT_TYPE = {
    PDF: "PDF",
    DOCX: "DOCX"
} as const;

export type DocumentType = typeof DOCUMENT_TYPE[keyof typeof DOCUMENT_TYPE];

import type { ResumeProcessingStage } from "../queues/resume-processing.types.js";

export const STAGE_PROGRESS_PERCENTAGES: Record<ResumeProcessingStage, number> = {
    QUEUED: 5,
    FETCHING_FILE: 15,
    EXTRACTION: 30,
    AI_PARSING: 60,
    NORMALIZATION: 80,
    PERSISTENCE: 95,
    COMPLETED: 100,
    FAILED: 100
};

// 1 Hour TTL for active processing micro-stage records
export const PROCESSING_STATE_TTL_SECONDS = 3600;
