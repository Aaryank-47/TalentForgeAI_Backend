import { describe, expect, it, jest } from "@jest/globals";
import { EmploymentType } from "@prisma/client";
import { OpenRouterError } from "../../../common/integrations/openRouter/errors/openrouter.error.js";
import { OpenRouterClient } from "../../../common/integrations/openRouter/openrouter.client.js";
import { RESUME_MIME_TYPES } from "../constants/resume.constants.js";
import { DocumentExtractionError } from "../errors/document-extraction.errors.js";
import { DocumentExtractorService } from "../services/document-extractor.service.js";
import { ResumeParserService } from "../services/resume-parser.service.js";
describe("ResumeParserService Fallback Tests", () => {
    const resumeParserService = new ResumeParserService();
    const mockValidJsonResponse = JSON.stringify({
        personal: {
            fullName: "Alex Smith",
            email: "alex.smith@example.com",
            phoneNumber: "+15550192834",
            currentLocation: "New York, NY",
            linkedinUrl: "https://linkedin.com/in/alexsmith",
            githubUrl: null,
            portfolioUrl: null,
            websiteUrl: null
        },
        professional: {
            headline: "Senior Software Engineer",
            bio: "7 years backend experience",
            currentCompany: "Acme Corp",
            currentDesignation: "Senior Engineer",
            totalExperience: 7
        },
        skills: [{ name: "Node.js", yearsOfExperience: 5 }],
        experience: [
            {
                companyName: "Acme Corp",
                designation: "Senior Engineer",
                employmentType: EmploymentType.FULL_TIME,
                description: "Backend development",
                location: "New York, NY",
                startDate: "2020",
                endDate: null,
                currentlyWorking: true
            }
        ],
        education: [],
        projects: [],
        certifications: []
    });
    it("16. Successful direct PDF parsing does NOT invoke local extraction", async () => {
        const generateDocSpy = jest
            .spyOn(OpenRouterClient, "generateFromDocument")
            .mockResolvedValue(mockValidJsonResponse);
        const extractSpy = jest.spyOn(DocumentExtractorService.prototype, "extractDocument");
        const pdfBuffer = Buffer.from("%PDF-1.4 dummy");
        const result = await resumeParserService.parseResumeDocumentWithFallback(pdfBuffer, RESUME_MIME_TYPES.PDF);
        expect(generateDocSpy).toHaveBeenCalledTimes(1);
        expect(extractSpy).not.toHaveBeenCalled();
        expect(result.personal.fullName).toBe("Alex Smith");
        generateDocSpy.mockRestore();
        extractSpy.mockRestore();
    });
    it("17. DOCX uses local extraction first without direct OpenRouter document API call", async () => {
        const extractSpy = jest
            .spyOn(DocumentExtractorService.prototype, "extractDocument")
            .mockResolvedValue({
            text: "Alex Smith Senior Software Engineer",
            wordCount: 5
        });
        const generateTextSpy = jest
            .spyOn(OpenRouterClient, "generateText")
            .mockResolvedValue(mockValidJsonResponse);
        const docxBuffer = Buffer.from("dummy docx content");
        const result = await resumeParserService.parseResumeDocumentWithFallback(docxBuffer, RESUME_MIME_TYPES.DOCX);
        expect(extractSpy).toHaveBeenCalledTimes(1);
        expect(generateTextSpy).toHaveBeenCalledTimes(1);
        expect(result.personal.fullName).toBe("Alex Smith");
        extractSpy.mockRestore();
        generateTextSpy.mockRestore();
    });
    it("18. & 19. PDF fallback invokes extraction after direct-parser failure and passes extracted text to parseResumeText()", async () => {
        const generateDocSpy = jest
            .spyOn(OpenRouterClient, "generateFromDocument")
            .mockRejectedValue(new OpenRouterError("Model failed to parse PDF document payload", 500));
        const extractSpy = jest
            .spyOn(DocumentExtractorService.prototype, "extractDocument")
            .mockResolvedValue({
            text: "Extracted PDF Text Alex Smith",
            wordCount: 5
        });
        const generateTextSpy = jest
            .spyOn(OpenRouterClient, "generateText")
            .mockResolvedValue(mockValidJsonResponse);
        const pdfBuffer = Buffer.from("%PDF-1.4 dummy");
        const result = await resumeParserService.parseResumeDocumentWithFallback(pdfBuffer, RESUME_MIME_TYPES.PDF);
        expect(generateDocSpy).toHaveBeenCalledTimes(1);
        expect(extractSpy).toHaveBeenCalledTimes(1);
        expect(generateTextSpy).toHaveBeenCalledTimes(1);
        expect(result.personal.fullName).toBe("Alex Smith");
        generateDocSpy.mockRestore();
        extractSpy.mockRestore();
        generateTextSpy.mockRestore();
    });
    it("20. OpenRouter 401 Unauthorized is NOT swallowed by local extraction fallback", async () => {
        const generateDocSpy = jest
            .spyOn(OpenRouterClient, "generateFromDocument")
            .mockRejectedValue(new OpenRouterError("Unauthorized: Invalid API Key", 401));
        const extractSpy = jest.spyOn(DocumentExtractorService.prototype, "extractDocument");
        const pdfBuffer = Buffer.from("%PDF-1.4 dummy");
        await expect(resumeParserService.parseResumeDocumentWithFallback(pdfBuffer, RESUME_MIME_TYPES.PDF)).rejects.toThrow("Unauthorized: Invalid API Key");
        expect(extractSpy).not.toHaveBeenCalled();
        generateDocSpy.mockRestore();
        extractSpy.mockRestore();
    });
    it("21. & 22. OpenRouter 403 Forbidden is NOT swallowed by fallback", async () => {
        const generateDocSpy = jest
            .spyOn(OpenRouterClient, "generateFromDocument")
            .mockRejectedValue(new OpenRouterError("Forbidden: Account suspended", 403));
        const extractSpy = jest.spyOn(DocumentExtractorService.prototype, "extractDocument");
        const pdfBuffer = Buffer.from("%PDF-1.4 dummy");
        await expect(resumeParserService.parseResumeDocumentWithFallback(pdfBuffer, RESUME_MIME_TYPES.PDF)).rejects.toThrow("Forbidden: Account suspended");
        expect(extractSpy).not.toHaveBeenCalled();
        generateDocSpy.mockRestore();
        extractSpy.mockRestore();
    });
    it("23. Extraction failure in fallback path is propagated cleanly", async () => {
        const generateDocSpy = jest
            .spyOn(OpenRouterClient, "generateFromDocument")
            .mockRejectedValue(new OpenRouterError("PDF payload unsupported", 500));
        const extractSpy = jest
            .spyOn(DocumentExtractorService.prototype, "extractDocument")
            .mockRejectedValue(new DocumentExtractionError("Corrupted PDF document"));
        const pdfBuffer = Buffer.from("%PDF-1.4 corrupted");
        await expect(resumeParserService.parseResumeDocumentWithFallback(pdfBuffer, RESUME_MIME_TYPES.PDF)).rejects.toThrow("Corrupted PDF document");
        generateDocSpy.mockRestore();
        extractSpy.mockRestore();
    });
    it("24. Empty extracted text throws error before reaching OpenRouter", async () => {
        const extractSpy = jest
            .spyOn(DocumentExtractorService.prototype, "extractDocument")
            .mockResolvedValue({
            text: "",
            wordCount: 0
        });
        const generateTextSpy = jest.spyOn(OpenRouterClient, "generateText");
        const docxBuffer = Buffer.from("empty docx");
        await expect(resumeParserService.parseResumeDocumentWithFallback(docxBuffer, RESUME_MIME_TYPES.DOCX)).rejects.toThrow("Resume content cannot be empty for parsing");
        expect(generateTextSpy).not.toHaveBeenCalled();
        extractSpy.mockRestore();
        generateTextSpy.mockRestore();
    });
});
//# sourceMappingURL=resume-parser-fallback.test.js.map