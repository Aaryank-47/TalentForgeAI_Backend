import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { OpenRouterError } from "../../../common/integrations/openRouter/errors/openrouter.error.js";
import { RESUME_MIME_TYPES } from "../constants/resume.constants.js";
import type { ResumeParsingResult } from "../interfaces/resume-parser.interface.js";
import type {
    ResumePersistenceResult,
    StageChangeMeta
} from "../interfaces/resume-persistence.interface.js";
import { ResumeProcessingPipeline } from "../pipelines/resume-processing.pipeline.js";
import type { ResumeProcessingStage } from "../queues/resume-processing.types.js";
import type { DocumentExtractorService } from "../services/document-extractor.service.js";
import type { ResumeNormalizationService } from "../services/resume-normalization.service.js";
import type { ResumeParserService } from "../services/resume-parser.service.js";
import type { ResumePersistenceService } from "../services/resume-persistence.service.js";

describe("ResumeProcessingPipeline", () => {
    let mockExtractorService: jest.Mocked<DocumentExtractorService>;
    let mockParserService: jest.Mocked<ResumeParserService>;
    let mockNormalizationService: jest.Mocked<ResumeNormalizationService>;
    let mockPersistenceService: jest.Mocked<ResumePersistenceService>;
    let mockFileFetcher: jest.MockedFunction<(url: string) => Promise<Buffer>>;
    let pipeline: ResumeProcessingPipeline;

    const sampleRawParsedData: ResumeParsingResult = {
        personal: {
            fullName: "Jane Doe",
            email: "jane.doe@example.com",
            phoneNumber: "+1234567890",
            currentLocation: "San Francisco, CA",
            linkedinUrl: "https://linkedin.com/in/janedoe",
            githubUrl: null,
            portfolioUrl: null,
            websiteUrl: null
        },
        professional: {
            headline: "Staff Engineer",
            bio: "Full stack expert",
            currentCompany: "Acme",
            currentDesignation: "Staff Software Engineer",
            totalExperience: 8
        },
        skills: [{ name: "TypeScript", yearsOfExperience: 6 }],
        experience: [],
        education: [],
        projects: [{ name: "TalentForge", description: "AI Platform" }],
        certifications: []
    };

    const sampleNormalizedData: ResumeParsingResult = {
        ...sampleRawParsedData,
        skills: [{ name: "TypeScript", yearsOfExperience: 6 }]
    };

    const samplePersistenceResult: ResumePersistenceResult = {
        candidateId: "candidate-1",
        skillsCreated: 1,
        skillsUpdated: 0,
        experiencesCreated: 0,
        experiencesUpdated: 0,
        educationCreated: 0,
        educationUpdated: 0,
        projectsCreated: 1,
        projectsUpdated: 0,
        certificationsCreated: 0,
        certificationsUpdated: 0
    };

    beforeEach(() => {
        mockExtractorService = {
            extractDocument: jest.fn<DocumentExtractorService["extractDocument"]>(),
            extractDocx: jest.fn<DocumentExtractorService["extractDocx"]>(),
            extractPdf: jest.fn<DocumentExtractorService["extractPdf"]>()
        } as any;

        mockParserService = {
            parseResumeDocument: jest.fn<ResumeParserService["parseResumeDocument"]>(),
            parseResumeText: jest.fn<ResumeParserService["parseResumeText"]>(),
            parseResumeDocumentWithFallback: jest.fn<ResumeParserService["parseResumeDocumentWithFallback"]>(),
            processParsingResponse: jest.fn<ResumeParserService["processParsingResponse"]>()
        } as any;

        mockNormalizationService = {
            normalizeResumeData: jest.fn<ResumeNormalizationService["normalizeResumeData"]>()
        } as any;

        mockPersistenceService = {
            persistResumeData: jest.fn<ResumePersistenceService["persistResumeData"]>()
        } as any;

        mockFileFetcher = jest.fn<(url: string) => Promise<Buffer>>().mockResolvedValue(
            Buffer.from("dummy-resume-buffer")
        );

        pipeline = new ResumeProcessingPipeline(
            mockExtractorService,
            mockParserService,
            mockNormalizationService,
            mockPersistenceService,
            mockFileFetcher
        );
    });

    it("successfully processes DOCX through explicit stages: FETCHING_FILE -> EXTRACTION -> AI_PARSING -> NORMALIZATION -> PERSISTENCE -> COMPLETED with DIRECT mode metadata", async () => {
        
        const recordedEvents: Array<{ 
            stage: ResumeProcessingStage; 
            meta: StageChangeMeta 
        }> = [];
        const onStageChange = (stage: ResumeProcessingStage, meta: StageChangeMeta) => {
            recordedEvents.push({ stage, meta });
        };

        mockExtractorService.extractDocument.mockResolvedValue({
            text: "Extracted DOCX plain text",
            wordCount: 4
        });
        mockParserService.parseResumeText.mockResolvedValue(sampleRawParsedData);
        mockNormalizationService.normalizeResumeData.mockResolvedValue(sampleNormalizedData);
        mockPersistenceService.persistResumeData.mockResolvedValue(samplePersistenceResult);

        const result = await pipeline.execute(
            {
                candidateId: "candidate-1",
                resumeId: "resume-1",
                fileReference: "https://storage.example.com/resume.docx",
                mimeType: RESUME_MIME_TYPES.DOCX
            },
            "job-docx-1",
            onStageChange
        );

        expect(recordedEvents.map((e) => e.stage)).toEqual([
            "FETCHING_FILE",
            "EXTRACTION",
            "AI_PARSING",
            "NORMALIZATION",
            "PERSISTENCE",
            "COMPLETED"
        ]);

        const extractionEvent = recordedEvents.find((e) => e.stage === "EXTRACTION");
        expect(extractionEvent?.meta.mode).toBe("DIRECT");

        const aiParsingEvent = recordedEvents.find((e) => e.stage === "AI_PARSING");
        expect(aiParsingEvent?.meta.mode).toBe("DIRECT");

        expect(mockFileFetcher).toHaveBeenCalledWith("https://storage.example.com/resume.docx");
        expect(mockExtractorService.extractDocument).toHaveBeenCalledWith(
            expect.any(Buffer),
            RESUME_MIME_TYPES.DOCX
        );
        expect(mockParserService.parseResumeText).toHaveBeenCalledWith("Extracted DOCX plain text");
        expect(mockNormalizationService.normalizeResumeData).toHaveBeenCalledWith(sampleRawParsedData);
        expect(mockPersistenceService.persistResumeData).toHaveBeenCalledWith(
            "candidate-1",
            sampleNormalizedData
        );
        expect(result.normalizedData).toEqual(sampleNormalizedData);
        expect(result.persistenceResult).toEqual(samplePersistenceResult);
    });

    it("successfully processes PDF direct AI through stages: FETCHING_FILE -> AI_PARSING -> NORMALIZATION -> PERSISTENCE -> COMPLETED with DIRECT mode metadata", async () => {
        const recordedEvents: Array<{ stage: ResumeProcessingStage; meta: StageChangeMeta }> = [];
        const onStageChange = (stage: ResumeProcessingStage, meta: StageChangeMeta) => {
            recordedEvents.push({ stage, meta });
        };

        mockParserService.parseResumeDocument.mockResolvedValue(sampleRawParsedData);
        mockNormalizationService.normalizeResumeData.mockResolvedValue(sampleNormalizedData);
        mockPersistenceService.persistResumeData.mockResolvedValue(samplePersistenceResult);

        const result = await pipeline.execute(
            {
                candidateId: "candidate-1",
                resumeId: "resume-1",
                fileReference: "https://storage.example.com/resume.pdf",
                mimeType: RESUME_MIME_TYPES.PDF
            },
            "job-pdf-1",
            onStageChange
        );

        expect(recordedEvents.map((e) => e.stage)).toEqual([
            "FETCHING_FILE",
            "AI_PARSING",
            "NORMALIZATION",
            "PERSISTENCE",
            "COMPLETED"
        ]);

        const aiParsingEvent = recordedEvents.find((e) => e.stage === "AI_PARSING");
        expect(aiParsingEvent?.meta.mode).toBe("DIRECT");

        expect(mockParserService.parseResumeDocument).toHaveBeenCalledWith(
            expect.any(Buffer),
            RESUME_MIME_TYPES.PDF
        );
        expect(mockExtractorService.extractDocument).not.toHaveBeenCalled();
        expect(result.normalizedData).toEqual(sampleNormalizedData);
    });

    it("triggers local PDF extraction fallback on direct AI failure and includes FALLBACK mode and reason metadata", async () => {
        const recordedEvents: Array<{ stage: ResumeProcessingStage; meta: StageChangeMeta }> = [];
        const onStageChange = (stage: ResumeProcessingStage, meta: StageChangeMeta) => {
            recordedEvents.push({ stage, meta });
        };

        mockParserService.parseResumeDocument.mockRejectedValue(
            new Error("Direct OpenRouter PDF payload processing failed")
        );
        mockExtractorService.extractDocument.mockResolvedValue({
            text: "Fallback extracted PDF text",
            wordCount: 4
        });
        mockParserService.parseResumeText.mockResolvedValue(sampleRawParsedData);
        mockNormalizationService.normalizeResumeData.mockResolvedValue(sampleNormalizedData);
        mockPersistenceService.persistResumeData.mockResolvedValue(samplePersistenceResult);

        const result = await pipeline.execute(
            {
                candidateId: "candidate-1",
                resumeId: "resume-1",
                fileReference: "https://storage.example.com/resume.pdf",
                mimeType: RESUME_MIME_TYPES.PDF
            },
            "job-pdf-fallback",
            onStageChange
        );

        expect(recordedEvents.map((e) => e.stage)).toEqual([
            "FETCHING_FILE",
            "AI_PARSING",
            "EXTRACTION",
            "AI_PARSING",
            "NORMALIZATION",
            "PERSISTENCE",
            "COMPLETED"
        ]);

        const extractionFallback = recordedEvents.find((e) => e.stage === "EXTRACTION");
        expect(extractionFallback?.meta.mode).toBe("FALLBACK");
        expect(extractionFallback?.meta.reason).toBe("Direct OpenRouter PDF payload processing failed");

        const secondAiParsing = recordedEvents.filter((e) => e.stage === "AI_PARSING")[1];
        expect(secondAiParsing?.meta.mode).toBe("FALLBACK");

        expect(mockExtractorService.extractDocument).toHaveBeenCalledWith(
            expect.any(Buffer),
            RESUME_MIME_TYPES.PDF
        );
        expect(mockParserService.parseResumeText).toHaveBeenCalledWith("Fallback extracted PDF text");
        expect(result.normalizedData).toEqual(sampleNormalizedData);
    });

    it("immediately throws non-retryable OpenRouter auth errors (401/403/404) without triggering local fallback", async () => {
        mockParserService.parseResumeDocument.mockRejectedValue(
            new OpenRouterError("Unauthorized: Invalid API key", 401)
        );

        await expect(
            pipeline.execute(
                {
                    candidateId: "candidate-1",
                    resumeId: "resume-1",
                    fileReference: "https://storage.example.com/resume.pdf",
                    mimeType: RESUME_MIME_TYPES.PDF
                },
                "job-auth-fail"
            )
        ).rejects.toThrow("Unauthorized: Invalid API key");

        expect(mockExtractorService.extractDocument).not.toHaveBeenCalled();
        expect(mockNormalizationService.normalizeResumeData).not.toHaveBeenCalled();
        expect(mockPersistenceService.persistResumeData).not.toHaveBeenCalled();
    });

    it("propagates critical file retrieval errors", async () => {
        mockFileFetcher.mockRejectedValue(new Error("Cloudinary connection timeout"));

        await expect(
            pipeline.execute(
                {
                    candidateId: "candidate-1",
                    resumeId: "resume-1",
                    fileReference: "https://storage.example.com/resume.pdf",
                    mimeType: RESUME_MIME_TYPES.PDF
                },
                "job-fetch-fail"
            )
        ).rejects.toThrow("Cloudinary connection timeout");
    });

    it("propagates critical normalization errors", async () => {
        mockParserService.parseResumeDocument.mockResolvedValue(sampleRawParsedData);
        mockNormalizationService.normalizeResumeData.mockRejectedValue(
            new Error("Skill normalization taxonomy lookup failed")
        );

        await expect(
            pipeline.execute(
                {
                    candidateId: "candidate-1",
                    resumeId: "resume-1",
                    fileReference: "https://storage.example.com/resume.pdf",
                    mimeType: RESUME_MIME_TYPES.PDF
                },
                "job-norm-fail"
            )
        ).rejects.toThrow("Skill normalization taxonomy lookup failed");
    });

    it("propagates critical persistence errors", async () => {
        mockParserService.parseResumeDocument.mockResolvedValue(sampleRawParsedData);
        mockNormalizationService.normalizeResumeData.mockResolvedValue(sampleNormalizedData);
        mockPersistenceService.persistResumeData.mockRejectedValue(
            new Error("Database transaction failed")
        );

        await expect(
            pipeline.execute(
                {
                    candidateId: "candidate-1",
                    resumeId: "resume-1",
                    fileReference: "https://storage.example.com/resume.pdf",
                    mimeType: RESUME_MIME_TYPES.PDF
                },
                "job-persist-fail"
            )
        ).rejects.toThrow("Database transaction failed");
    });
});
