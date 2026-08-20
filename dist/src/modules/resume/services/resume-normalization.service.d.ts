import type { ResumeParsingResult } from "../interfaces/resume-parser.interface.js";
export declare class ResumeNormalizationService {
    private readonly skillNormalizationService;
    normalizeResumeData(data: ResumeParsingResult): Promise<ResumeParsingResult>;
    private normalizePersonal;
    private normalizeProfessional;
    private normalizeExperience;
    private normalizeEducation;
    private normalizeProjects;
    private normalizeCertifications;
}
//# sourceMappingURL=resume-normalization.service.d.ts.map