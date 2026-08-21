import { OpenRouterError } from "../../../common/integrations/openRouter/errors/openrouter.error.js";
import { OpenRouterClient } from "../../../common/integrations/openRouter/openrouter.client.js";
import { logger } from "../../../common/logger/logger.js";
import { DIRECT_AI_SUPPORTED_MIME_TYPES, RESUME_MIME_TYPES } from "../constants/resume.constants.js";
import { resumeParsingSchema } from "../dto/resume-parser.dto.js";
import type { ResumeParsingResult } from "../interfaces/resume-parser.interface.js";
import { RESUME_PARSER_SYSTEM_PROMPT } from "../utils/resume-parser.prompt.js";
import { DocumentExtractorService } from "./document-extractor.service.js";

export class ResumeParserService {
    private readonly documentExtractorService = new DocumentExtractorService();

    public async parseResumeText(
        resumeText: string
    ): Promise<ResumeParsingResult> {
        if (!resumeText || resumeText.trim().length === 0) {
            throw new Error("Resume content cannot be empty for parsing");
        }

        const userPrompt = `Parse the following resume text:\n\n-------------------------\n${resumeText.trim()}\n-------------------------`;

        const aiResponseContent = await OpenRouterClient.generateText({
            systemPrompt: RESUME_PARSER_SYSTEM_PROMPT,
            userPrompt,
            temperature: 0.1
        });

        return await this.processParsingResponse(aiResponseContent);
    }

    public async parseResumeDocument(
        documentBuffer: Buffer,
        mimeType: string
    ): Promise<ResumeParsingResult> {
        if (!documentBuffer || documentBuffer.length === 0) {
            throw new Error("Resume document buffer cannot be empty");
        }
        if (!mimeType || mimeType.trim().length === 0) {
            throw new Error("MIME type is required for document parsing");
        }

        const normalizedMimeType = mimeType.trim().toLowerCase();

        const isDirectlySupported = (DIRECT_AI_SUPPORTED_MIME_TYPES as readonly string[]).includes(normalizedMimeType);
        if (!isDirectlySupported) {
            throw new Error(
                `Direct AI document parsing is not supported for mime type "${normalizedMimeType}". Supported formats for direct document parsing are PDF and images. DOCX documents require text extraction fallback.`
            );
        }

        const userPrompt = "Parse the attached resume document into structured JSON according to the schema instructions.";

        const aiResponseContent = await OpenRouterClient.generateFromDocument({
            systemPrompt: RESUME_PARSER_SYSTEM_PROMPT,
            userPrompt,
            documentBuffer,
            mimeType: normalizedMimeType,
            temperature: 0.1
        });

        return await this.processParsingResponse(aiResponseContent);
    }

    public async parseResumeDocumentWithFallback(
        documentBuffer: Buffer,
        mimeType: string
    ): Promise<ResumeParsingResult> {
        if (!documentBuffer || documentBuffer.length === 0) {
            throw new Error("Resume document buffer cannot be empty");
        }
        if (!mimeType || mimeType.trim().length === 0) {
            throw new Error("MIME type is required for document parsing");
        }

        const normalizedMimeType = mimeType.trim().toLowerCase();

        // 1. DOCX path: DOCX cannot be sent as direct Data URL API input to OpenRouter, so it routes directly to local fallback text extraction first.
        if (normalizedMimeType === RESUME_MIME_TYPES.DOCX) {
            logger.info("[ResumeParserService] Processing DOCX via local text extraction fallback path...");
            const extractionResult = await this.documentExtractorService.extractDocument(documentBuffer, normalizedMimeType);
            return this.parseResumeText(extractionResult.text);
        }

        // 2. PDF / Image path: Attempt direct OpenRouter document parsing first.
        try {
            return await this.parseResumeDocument(documentBuffer, normalizedMimeType);
        } catch (error: unknown) {
            // Do NOT hide OpenRouter authentication, forbidden, or missing configuration errors (401, 403, 404).
            if (error instanceof OpenRouterError && [401, 403, 404].includes(error.statusCode ?? 0)) {
                throw error;
            }

            logger.warn(
                `[ResumeParserService] Direct OpenRouter document parsing failed (${error instanceof Error ? error.message : "Unknown error"}). Triggering local PDF text extraction fallback...`
            );

            // 3. Fallback: extract text locally and pass extracted text to parseResumeText()
            const extractionResult = await this.documentExtractorService.extractDocument(documentBuffer, normalizedMimeType);
            return this.parseResumeText(extractionResult.text);
        }
    }

    public async processParsingResponse(
        aiResponseContent: string
    ): Promise<ResumeParsingResult> {
        if (!aiResponseContent || aiResponseContent.trim().length === 0) {
            throw new Error("OpenRouter returned an empty AI response for resume parsing");
        }

        const cleanedJsonString = this.extractJsonString(aiResponseContent);

        let parsedRawData: unknown;
        try {
            parsedRawData = JSON.parse(cleanedJsonString);
        } catch (parseError: unknown) {
            const message = parseError instanceof Error
                ? parseError.message
                : "Unknown JSON parsing error";

            throw new Error(`Failed to parse AI response as JSON: ${message}`);
        }

        const validationResult = resumeParsingSchema.safeParse(parsedRawData);

        if (!validationResult.success) {
            const formattedErrors = validationResult.error.issues
                .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
                .join("; ");
            throw new Error(`AI resume parsing response failed validation: ${formattedErrors}`);
        }

        return validationResult.data as ResumeParsingResult;
    }

    private extractJsonString(rawContent: string): string {
        const content = rawContent.trim();

        const fencedMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

        if (fencedMatch && fencedMatch[1]) {
            return fencedMatch[1].trim();
        }

        const firstBrace = content.indexOf("{");
        const lastBrace = content.lastIndexOf("}");

        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            return content.slice(firstBrace, lastBrace + 1);
        }

        return content;
    }
}