import type { StageChangeHandler, PipelineExecutionResult } from "../interfaces/resume-pipeline.interface.js";
import type { ResumeProcessingJobData } from "../queues/resume-processing.types.js";
import { DocumentExtractorService } from "../services/document-extractor.service.js";
import { ResumeNormalizationService } from "../services/resume-normalization.service.js";
import { ResumeParserService } from "../services/resume-parser.service.js";
import { ResumePersistenceService } from "../services/resume-persistence.service.js";
export declare class ResumeProcessingPipeline {
    private readonly documentExtractorService;
    private readonly resumeParserService;
    private readonly resumeNormalizationService;
    private readonly resumePersistenceService;
    private readonly fileFetcher;
    constructor(documentExtractorService?: DocumentExtractorService, resumeParserService?: ResumeParserService, resumeNormalizationService?: ResumeNormalizationService, resumePersistenceService?: ResumePersistenceService, fileFetcher?: (url: string) => Promise<Buffer>);
    /**
     * Executes the explicit, hardened multi-stage resume processing pipeline:
     * 1. FETCHING_FILE
     * 2. EXTRACTION (when extracting text locally for DOCX or PDF fallback)
     * 3. AI_PARSING (calling OpenRouter for structured JSON)
     * 4. NORMALIZATION (deterministic schema, field & skill taxonomy normalization)
     * 5. PERSISTENCE (atomic database transactions)
     *
     * Note: The final COMPLETED event and database status transition are orchestrated by the Worker
     * only after persistence succeeds and the database record is updated to COMPLETED.
     */
    execute(jobData: ResumeProcessingJobData, jobId: string, onStageChange?: StageChangeHandler): Promise<PipelineExecutionResult>;
    private notifyStage;
}
//# sourceMappingURL=resume-processing.pipeline.d.ts.map