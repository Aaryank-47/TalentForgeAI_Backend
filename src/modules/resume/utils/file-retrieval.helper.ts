import { logger } from "../../../common/logger/logger.js";

/**
 * Downloads a file buffer from a durable remote reference (e.g. Cloudinary secure URL).
 * 
 * @param url Remote URL of the stored file
 * @param timeoutMs Maximum download timeout in milliseconds (default: 30,000ms)
 * @returns Buffer containing the file content
 */
export async function fetchFileBufferFromUrl(
    url: string,
    timeoutMs: number = 30000
): Promise<Buffer> {
    if (!url || typeof url !== "string" || !url.trim()) {
        throw new Error("Invalid file reference URL provided");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        logger.info({ url: url.slice(0, 100) }, "[FileRetrievalHelper] Downloading file buffer from remote storage...");

        const response = await fetch(url, {
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error(`Failed to retrieve file from storage: HTTP ${response.status} ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (buffer.length === 0) {
            throw new Error("Downloaded file buffer is empty");
        }

        logger.info({ bytes: buffer.length }, "[FileRetrievalHelper] File buffer retrieved successfully");
        return buffer;
    } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
            throw new Error(`File download timed out after ${timeoutMs}ms`);
        }
        throw error;
    } finally {
        clearTimeout(timeout);
    }
}
