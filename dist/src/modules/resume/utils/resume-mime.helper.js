import { RESUME_MIME_TYPES } from "../constants/resume.constants.js";
/**
 * Infers the canonical MIME type from a resume file name or extension.
 * Supports PDF, DOCX, PNG, JPEG, and WEBP.
 *
 * @param fileName Original file name or path
 * @returns Canonical MIME type string
 */
export function inferResumeMimeType(fileName) {
    if (!fileName || typeof fileName !== "string") {
        return RESUME_MIME_TYPES.PDF;
    }
    const lower = fileName.trim().toLowerCase();
    if (lower.endsWith(".docx")) {
        return RESUME_MIME_TYPES.DOCX;
    }
    if (lower.endsWith(".pdf")) {
        return RESUME_MIME_TYPES.PDF;
    }
    if (lower.endsWith(".png")) {
        return RESUME_MIME_TYPES.PNG;
    }
    if (lower.endsWith(".jpeg") || lower.endsWith(".jpg")) {
        return RESUME_MIME_TYPES.JPEG;
    }
    if (lower.endsWith(".webp")) {
        return RESUME_MIME_TYPES.WEBP;
    }
    return RESUME_MIME_TYPES.PDF;
}
//# sourceMappingURL=resume-mime.helper.js.map