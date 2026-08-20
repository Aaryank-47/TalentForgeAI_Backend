export function cleanExtractedText(rawText: string | undefined | null): string {
    if (!rawText || typeof rawText !== "string") {
        return "";
    }

    return rawText
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/^--\s*\d+\s*of\s*\d+\s*--$/gm, "")
        .replace(/^---\s*Page\s*\d+\s*---$/gm, "")
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .split("\n")
        .map((line: string) => line.trim())
        .filter(Boolean)
        .join("\n")
        .trim();
}

export function calculateWordCount(text: string): number {
    if (!text || text.trim().length === 0) {
        return 0;
    }
    return text.trim().split(/\s+/).filter(Boolean).length;
}
