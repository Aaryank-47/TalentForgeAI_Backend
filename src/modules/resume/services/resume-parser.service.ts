import { OpenRouterClient } from "../../../common/integrations/openRouter/openrouter.client.js";
import { DIRECT_AI_SUPPORTED_MIME_TYPES } from "../constants/resume.constants.js";
import { resumeParsingSchema } from "../dto/resume-parser.dto.js";
import type { ResumeParsingResult } from "../interfaces/resume-parser.interface.js";
import { RESUME_PARSER_SYSTEM_PROMPT } from "../utils/resume-parser.prompt.js";

export class ResumeParserService {

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

        return this.processParsingResponse(aiResponseContent);
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

        return this.processParsingResponse(aiResponseContent);
    }

    private processParsingResponse(
        aiResponseContent: string
    ): ResumeParsingResult {
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

        return validationResult.data;
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