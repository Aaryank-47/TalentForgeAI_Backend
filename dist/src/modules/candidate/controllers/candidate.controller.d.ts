import type { Request, Response } from "express";
export declare class CandidateController {
    static createCandidateProfile(req: Request, res: Response): Promise<void>;
    static getCandidateProfile(req: Request, res: Response): Promise<void>;
    static updateCandidateProfile(req: Request, res: Response): Promise<void>;
    static getProfileCompletion(req: Request, res: Response): Promise<void>;
    static uploadResume(req: Request, res: Response): Promise<void>;
    static getResumes(req: Request, res: Response): Promise<void>;
    static getResumeById(req: Request, res: Response): Promise<void>;
    static retryResumeProcessing(req: Request, res: Response): Promise<void>;
    static deleteResumes(req: Request, res: Response): Promise<void>;
    static addSkills(req: Request, res: Response): Promise<void>;
    static getSkills(req: Request, res: Response): Promise<void>;
    static updateSkill(req: Request, res: Response): Promise<void>;
    static deleteSkills(req: Request, res: Response): Promise<void>;
    static addEducation(req: Request, res: Response): Promise<void>;
    static getEducations(req: Request, res: Response): Promise<void>;
    static getEducationById(req: Request, res: Response): Promise<void>;
    static updateEducation(req: Request, res: Response): Promise<void>;
    static deleteEducation(req: Request, res: Response): Promise<void>;
    static addExperience(req: Request, res: Response): Promise<void>;
    static getExperiences(req: Request, res: Response): Promise<void>;
    static getExperienceById(req: Request, res: Response): Promise<void>;
    static updateExperience(req: Request, res: Response): Promise<void>;
    static deleteExperience(req: Request, res: Response): Promise<void>;
    static getPublicProfile(req: Request, res: Response): Promise<void>;
    static getCandidateResumes(req: Request, res: Response): Promise<void>;
    static toggleOpenToWork(req: Request, res: Response): Promise<void>;
    static updateSalaryPreferences(req: Request, res: Response): Promise<void>;
    static updateLocationPreferences(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=candidate.controller.d.ts.map