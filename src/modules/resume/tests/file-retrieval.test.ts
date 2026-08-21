import { describe, expect, it, jest, beforeEach, afterEach } from "@jest/globals";
import { fetchFileBufferFromUrl } from "../utils/file-retrieval.helper.js";

describe("fetchFileBufferFromUrl", () => {
    const originalFetch = global.fetch;

    afterEach(() => {
        global.fetch = originalFetch;
        jest.restoreAllMocks();
    });

    it("successfully downloads file buffer from valid URL", async () => {
        const text = "test resume content";
        const uint8 = new TextEncoder().encode(text);
        global.fetch = jest.fn<typeof fetch>().mockResolvedValue({
            ok: true,
            status: 200,
            arrayBuffer: async () => uint8.buffer
        } as Response);

        const result = await fetchFileBufferFromUrl("https://res.cloudinary.com/demo/raw/upload/resume.pdf");

        expect(result).toBeInstanceOf(Buffer);
        expect(result.toString()).toBe("test resume content");
    });

    it("throws error if URL is empty or whitespace", async () => {
        await expect(fetchFileBufferFromUrl("")).rejects.toThrow("Invalid file reference URL provided");
        await expect(fetchFileBufferFromUrl("   ")).rejects.toThrow("Invalid file reference URL provided");
    });

    it("throws error when HTTP response is not ok", async () => {
        global.fetch = jest.fn<typeof fetch>().mockResolvedValue({
            ok: false,
            status: 404,
            statusText: "Not Found"
        } as Response);

        await expect(
            fetchFileBufferFromUrl("https://res.cloudinary.com/demo/raw/upload/missing.pdf")
        ).rejects.toThrow("Failed to retrieve file from storage: HTTP 404 Not Found");
    });

    it("throws error when downloaded buffer is empty", async () => {
        global.fetch = jest.fn<typeof fetch>().mockResolvedValue({
            ok: true,
            status: 200,
            arrayBuffer: async () => new ArrayBuffer(0)
        } as Response);

        await expect(
            fetchFileBufferFromUrl("https://res.cloudinary.com/demo/raw/upload/empty.pdf")
        ).rejects.toThrow("Downloaded file buffer is empty");
    });
});
