import type { ResumeParsingResult } from "../interfaces/resume-parser.interface.js";
import type { ResumePersistenceResult } from "../interfaces/resume-persistence.interface.js";
export interface ResumePersistencePort {
    persist(candidateId: string, data: ResumeParsingResult): Promise<ResumePersistenceResult>;
}
export declare class ResumePersistenceService {
    private readonly repository;
    constructor(repository?: ResumePersistencePort);
    persistResumeData(candidateId: string, data: ResumeParsingResult): Promise<ResumePersistenceResult>;
}
//# sourceMappingURL=resume-persistence.service.d.ts.map