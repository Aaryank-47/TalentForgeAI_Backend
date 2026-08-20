export const DIRECT_AI_SUPPORTED_MIME_TYPES = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/webp"
] as const;

export type DirectAiSupportedMimeType = typeof DIRECT_AI_SUPPORTED_MIME_TYPES[number];
