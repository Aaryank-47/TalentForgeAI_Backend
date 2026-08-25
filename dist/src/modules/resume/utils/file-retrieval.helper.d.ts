/**
 * Downloads a file buffer from a durable remote reference (e.g. Cloudinary secure URL).
 *
 * @param url Remote URL of the stored file
 * @param timeoutMs Maximum download timeout in milliseconds (default: 30,000ms)
 * @returns Buffer containing the file content
 */
export declare function fetchFileBufferFromUrl(url: string, timeoutMs?: number): Promise<Buffer>;
//# sourceMappingURL=file-retrieval.helper.d.ts.map