import type { ResumeParsingResult } from "../interfaces/resume-parser.interface.js";
import type { ResumePersistenceResult } from "../interfaces/resume-persistence.interface.js";
export declare class ResumePersistenceRepository {
    persist(candidateId: string, data: ResumeParsingResult): Promise<ResumePersistenceResult>;
    private persistInTransaction;
    private persistSkills;
    private persistExperiences;
    private persistEducation;
    private persistProjects;
    private persistCertifications;
}
//# sourceMappingURL=resume-persistence.repository.d.ts.map