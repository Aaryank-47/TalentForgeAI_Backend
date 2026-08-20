import { describe, expect, it, jest } from "@jest/globals";
import mammoth from "mammoth";
import { RESUME_MIME_TYPES } from "../constants/resume.constants.js";
import { DocumentExtractionError, EmptyDocumentTextError, ScannedPdfDetectedError, UnsupportedFileTypeError } from "../errors/document-extraction.errors.js";
import { DocumentExtractorService } from "../services/document-extractor.service.js";
import { calculateWordCount, cleanExtractedText } from "../utils/document-extraction.utils.js";
describe("Document Extractor Unit Tests", () => {
    const documentExtractorService = new DocumentExtractorService();
    const validPdfBuffer = Buffer.from("%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj 4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj 5 0 obj<</Length 44>>stream\nBT /F1 12 Tf 100 700 Td (Hello World) Tj ET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000261 00000 n \n0000000330 00000 n \ntrailer<</Size 6/Root 1 0 R>>\nstartxref\n425\n%%EOF");
    const scannedPdfBuffer = Buffer.from("%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF");
    describe("Text Cleaning & Word Count Utils", () => {
        it("should clean extracted text conservatively without dropping real content", () => {
            const rawText = "John Doe  \r\n\r\n\n  Software   Engineer  \n\n\n\nSkills: Node.js  ";
            const cleaned = cleanExtractedText(rawText);
            expect(cleaned).toBe("John Doe\nSoftware Engineer\nSkills: Node.js");
        });
        it("should calculate word count accurately ignoring repeated whitespace", () => {
            const text = "John Doe is a Senior Software Engineer.";
            expect(calculateWordCount(text)).toBe(7);
            expect(calculateWordCount("   ")).toBe(0);
        });
    });
    describe("PDF Extraction (extractPdf)", () => {
        it("1. Valid PDF extracts text and returns page count and word count", async () => {
            const result = await documentExtractorService.extractPdf(validPdfBuffer);
            expect(result.text).toContain("Hello World");
            expect(result.wordCount).toBeGreaterThan(0);
            expect(result.pageCount).toBe(1);
        });
        it("3. Empty PDF buffer throws DocumentExtractionError", async () => {
            await expect(documentExtractorService.extractPdf(Buffer.from(""))).rejects.toThrow(DocumentExtractionError);
        });
        it("5. Corrupted PDF throws DocumentExtractionError", async () => {
            await expect(documentExtractorService.extractPdf(Buffer.from("corrupted pdf data"))).rejects.toThrow(DocumentExtractionError);
        });
        it("11. Scanned PDF detection throws ScannedPdfDetectedError when pageCount > 0 but text is empty", async () => {
            await expect(documentExtractorService.extractPdf(scannedPdfBuffer)).rejects.toThrow(ScannedPdfDetectedError);
        });
    });
    describe("DOCX Extraction (extractDocx)", () => {
        it("2. Valid DOCX extracts text and 14. calculates word count", async () => {
            const extractSpy = jest
                .spyOn(mammoth, "extractRawText")
                .mockResolvedValue({ value: "Jane Doe\nFull Stack Developer", messages: [] });
            const buffer = Buffer.from("dummy docx");
            const result = await documentExtractorService.extractDocx(buffer);
            expect(result.text).toBe("Jane Doe\nFull Stack Developer");
            expect(result.wordCount).toBe(5);
            extractSpy.mockRestore();
        });
        it("4. Empty DOCX buffer throws DocumentExtractionError", async () => {
            await expect(documentExtractorService.extractDocx(Buffer.from(""))).rejects.toThrow(DocumentExtractionError);
        });
        it("6. Corrupted DOCX parsing failure throws DocumentExtractionError", async () => {
            const extractSpy = jest
                .spyOn(mammoth, "extractRawText")
                .mockRejectedValue(new Error("Zip end of central directory signature not found"));
            await expect(documentExtractorService.extractDocx(Buffer.from("corrupted docx"))).rejects.toThrow(DocumentExtractionError);
            extractSpy.mockRestore();
        });
        it("10. Empty extracted DOCX throws EmptyDocumentTextError", async () => {
            const extractSpy = jest
                .spyOn(mammoth, "extractRawText")
                .mockResolvedValue({ value: "   \n   ", messages: [] });
            await expect(documentExtractorService.extractDocx(Buffer.from("empty docx"))).rejects.toThrow(EmptyDocumentTextError);
            extractSpy.mockRestore();
        });
    });
    describe("DocumentExtractorService Dispatcher (extractDocument)", () => {
        it("8. MIME type normalization strips whitespace and case for PDF", async () => {
            const result = await documentExtractorService.extractDocument(validPdfBuffer, " APPLICATION/PDF ");
            expect(result.text).toContain("Hello World");
        });
        it("8. MIME type normalization routes DOCX correctly", async () => {
            const extractSpy = jest
                .spyOn(mammoth, "extractRawText")
                .mockResolvedValue({ value: "DOCX Content", messages: [] });
            const result = await documentExtractorService.extractDocument(Buffer.from("docx"), `  ${RESUME_MIME_TYPES.DOCX}  `);
            expect(result.text).toBe("DOCX Content");
            extractSpy.mockRestore();
        });
        it("7. Unsupported MIME type throws UnsupportedFileTypeError", async () => {
            await expect(documentExtractorService.extractDocument(Buffer.from("txt"), "text/plain")).rejects.toThrow(UnsupportedFileTypeError);
        });
    });
});
//# sourceMappingURL=document-extractor.test.js.map