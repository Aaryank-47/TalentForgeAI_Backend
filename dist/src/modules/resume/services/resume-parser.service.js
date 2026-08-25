import { OpenRouterError } from "../../../common/integrations/openRouter/errors/openrouter.error.js";
import { OpenRouterClient } from "../../../common/integrations/openRouter/openrouter.client.js";
import { logger } from "../../../common/logger/logger.js";
import { DIRECT_AI_SUPPORTED_MIME_TYPES, RESUME_MIME_TYPES } from "../constants/resume.constants.js";
import { resumeParsingSchema } from "../dto/resume-parser.dto.js";
import { RESUME_PARSER_SYSTEM_PROMPT } from "../utils/resume-parser.prompt.js";
import { DocumentExtractorService } from "./document-extractor.service.js";
export class ResumeParserService {
    documentExtractorService = new DocumentExtractorService();
    async parseResumeText(resumeText) {
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
    async parseResumeDocument(documentBuffer, mimeType) {
        if (!documentBuffer || documentBuffer.length === 0) {
            throw new Error("Resume document buffer cannot be empty");
        }
        if (!mimeType || mimeType.trim().length === 0) {
            throw new Error("MIME type is required for document parsing");
        }
        const normalizedMimeType = mimeType.trim().toLowerCase();
        const isDirectlySupported = DIRECT_AI_SUPPORTED_MIME_TYPES.includes(normalizedMimeType);
        if (!isDirectlySupported) {
            throw new Error(`Direct AI document parsing is not supported for mime type "${normalizedMimeType}". Supported formats for direct document parsing are PDF and images. DOCX documents require text extraction fallback.`);
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
    async parseResumeDocumentWithFallback(documentBuffer, mimeType) {
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
        }
        catch (error) {
            // Do NOT hide OpenRouter authentication, forbidden, or missing configuration errors (401, 403, 404).
            if (error instanceof OpenRouterError && [401, 403, 404].includes(error.statusCode ?? 0)) {
                throw error;
            }
            logger.warn(`[ResumeParserService] Direct OpenRouter document parsing failed (${error instanceof Error ? error.message : "Unknown error"}). Triggering local PDF text extraction fallback...`);
            // 3. Fallback: extract text locally and pass extracted text to parseResumeText()
            const extractionResult = await this.documentExtractorService.extractDocument(documentBuffer, normalizedMimeType);
            return this.parseResumeText(extractionResult.text);
        }
    }
    async processParsingResponse(aiResponseContent) {
        if (!aiResponseContent || aiResponseContent.trim().length === 0) {
            throw new Error("OpenRouter returned an empty AI response for resume parsing");
        }
        const cleanedJsonString = this.extractJsonString(aiResponseContent);
        let parsedRawData;
        try {
            parsedRawData = JSON.parse(cleanedJsonString);
        }
        catch (parseError) {
            const message = parseError instanceof Error
                ? parseError.message
                : "Unknown JSON parsing error";
            throw new Error(`Failed to parse AI response as JSON: ${message}`);
        }
        // Structural check: root must strictly be an object and not an array/primitive
        if (typeof parsedRawData !== "object" || parsedRawData === null || Array.isArray(parsedRawData)) {
            throw new Error("AI resume parsing response failed validation: Root response must be a JSON object");
        }
        // Pre-validation Sanitization & Deterministic Partial Recovery
        const sanitizedData = this.sanitizeAiResponse(parsedRawData);
        const validationResult = resumeParsingSchema.safeParse(sanitizedData);
        if (!validationResult.success) {
            const formattedErrors = validationResult.error.issues
                .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
                .join("; ");
            throw new Error(`AI resume parsing response failed validation: ${formattedErrors}`);
        }
        return validationResult.data;
    }
    /**
     * Sanitizes AI response before final schema validation:
     * - Trims strings
     * - Normalizes placeholder strings ("N/A", "NA", "none", "not specified", "unknown", "") to null for optional scalar fields
     * - Safely filters out isolated unrecoverable array entries (e.g. malformed null or non-object items in skills/experience/education)
     *   while preserving structural strictness if an entire section is of the wrong data type.
     */
    sanitizeAiResponse(raw) {
        const sanitized = { ...raw };
        // Helper to normalize harmless empty / placeholder strings
        const sanitizeScalar = (val) => {
            if (typeof val === "string") {
                const trimmed = val.trim();
                const lower = trimmed.toLowerCase();
                if (trimmed === "" ||
                    lower === "n/a" ||
                    lower === "na" ||
                    lower === "none" ||
                    lower === "not specified" ||
                    lower === "not applicable" ||
                    lower === "unknown" ||
                    lower === "null" ||
                    lower === "undefined") {
                    return null;
                }
                return trimmed;
            }
            return val;
        };
        // 1. Personal
        if (sanitized.personal && typeof sanitized.personal === "object" && !Array.isArray(sanitized.personal)) {
            const p = { ...sanitized.personal };
            for (const key of Object.keys(p)) {
                p[key] = sanitizeScalar(p[key]);
            }
            sanitized.personal = p;
        }
        // 2. Professional
        if (sanitized.professional && typeof sanitized.professional === "object" && !Array.isArray(sanitized.professional)) {
            const pr = { ...sanitized.professional };
            pr.headline = sanitizeScalar(pr.headline);
            pr.bio = sanitizeScalar(pr.bio);
            pr.currentCompany = sanitizeScalar(pr.currentCompany);
            pr.currentDesignation = sanitizeScalar(pr.currentDesignation);
            if (typeof pr.totalExperience === "string") {
                const parsedNum = parseFloat(pr.totalExperience);
                pr.totalExperience = Number.isFinite(parsedNum) && parsedNum >= 0 ? parsedNum : null;
            }
            sanitized.professional = pr;
        }
        // 3. Skills: Safe array sanitization & recovery for minor malformed elements
        if (Array.isArray(sanitized.skills)) {
            const validSkills = [];
            for (let i = 0; i < sanitized.skills.length; i++) {
                const s = sanitized.skills[i];
                if (!s || typeof s !== "object") {
                    logger.warn(`[ResumeParserService] Skipping invalid non-object skill item at index ${i}`);
                    continue;
                }
                let name = sanitizeScalar(s.name);
                if (typeof name !== "string" || name.length === 0) {
                    logger.warn(`[ResumeParserService] Skipping skill item with empty name at index ${i}`);
                    continue;
                }
                let years = s.yearsOfExperience;
                if (typeof years === "string") {
                    const parsedYears = parseFloat(years);
                    years = Number.isFinite(parsedYears) && parsedYears >= 0 ? parsedYears : null;
                }
                validSkills.push({
                    name,
                    yearsOfExperience: typeof years === "number" ? years : null
                });
            }
            sanitized.skills = validSkills;
        }
        // 4. Experience: Safe array sanitization
        if (Array.isArray(sanitized.experience)) {
            const validExp = [];
            for (let i = 0; i < sanitized.experience.length; i++) {
                const exp = sanitized.experience[i];
                if (!exp || typeof exp !== "object") {
                    logger.warn(`[ResumeParserService] Skipping invalid non-object experience item at index ${i}`);
                    continue;
                }
                const companyName = sanitizeScalar(exp.companyName);
                const designation = sanitizeScalar(exp.designation);
                // If critical required identity fields are missing, skip this isolated item
                if (!companyName || !designation) {
                    logger.warn(`[ResumeParserService] Skipping experience item missing companyName or designation at index ${i}`);
                    continue;
                }
                validExp.push({
                    companyName,
                    designation,
                    employmentType: sanitizeScalar(exp.employmentType),
                    description: sanitizeScalar(exp.description),
                    location: sanitizeScalar(exp.location),
                    startDate: sanitizeScalar(exp.startDate),
                    endDate: sanitizeScalar(exp.endDate),
                    currentlyWorking: Boolean(exp.currentlyWorking)
                });
            }
            sanitized.experience = validExp;
        }
        // 5. Education: Safe array sanitization (handles fieldOfStudy: null gracefully)
        if (Array.isArray(sanitized.education)) {
            const validEdu = [];
            for (let i = 0; i < sanitized.education.length; i++) {
                const edu = sanitized.education[i];
                if (!edu || typeof edu !== "object") {
                    logger.warn(`[ResumeParserService] Skipping invalid non-object education item at index ${i}`);
                    continue;
                }
                const collegeName = sanitizeScalar(edu.collegeName);
                const degree = sanitizeScalar(edu.degree);
                // If critical required identity fields are missing, skip this isolated item
                if (!collegeName || !degree) {
                    logger.warn(`[ResumeParserService] Skipping education item missing collegeName or degree at index ${i}`);
                    continue;
                }
                let grade = edu.grade;
                if (typeof grade === "string") {
                    const parsedGrade = parseFloat(grade);
                    grade = Number.isFinite(parsedGrade) && parsedGrade >= 0 ? parsedGrade : null;
                }
                validEdu.push({
                    collegeName,
                    degree,
                    fieldOfStudy: sanitizeScalar(edu.fieldOfStudy),
                    currentlyStudying: Boolean(edu.currentlyStudying),
                    startDate: sanitizeScalar(edu.startDate),
                    endDate: sanitizeScalar(edu.endDate),
                    gradingSystem: sanitizeScalar(edu.gradingSystem),
                    gradeText: sanitizeScalar(edu.gradeText),
                    grade: typeof grade === "number" ? grade : null
                });
            }
            sanitized.education = validEdu;
        }
        // 6. Projects: Safe array sanitization
        if (Array.isArray(sanitized.projects)) {
            const validProj = [];
            for (let i = 0; i < sanitized.projects.length; i++) {
                const proj = sanitized.projects[i];
                if (!proj || typeof proj !== "object")
                    continue;
                const name = sanitizeScalar(proj.name);
                if (!name)
                    continue;
                validProj.push({
                    name,
                    description: sanitizeScalar(proj.description)
                });
            }
            sanitized.projects = validProj;
        }
        // 7. Certifications: Safe array sanitization
        if (Array.isArray(sanitized.certifications)) {
            const validCert = [];
            for (let i = 0; i < sanitized.certifications.length; i++) {
                const cert = sanitized.certifications[i];
                if (!cert || typeof cert !== "object")
                    continue;
                const name = sanitizeScalar(cert.name);
                if (!name)
                    continue;
                validCert.push({
                    name
                });
            }
            sanitized.certifications = validCert;
        }
        return sanitized;
    }
    extractJsonString(rawContent) {
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
//# sourceMappingURL=resume-parser.service.js.map