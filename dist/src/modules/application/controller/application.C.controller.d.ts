import type { Request, Response } from "express";
import type { ApplyJobDto, WithdrawApplicationDto, ApplicationIdParamDto } from "../dto/application.dto.js";
export declare class ApplicationController {
    static applyJob(req: Request<ApplyJobDto>, res: Response): Promise<void>;
    static getCandidateApplications(req: Request, res: Response): Promise<void>;
    static getCandidateApplicationDetails(req: Request, res: Response): Promise<void>;
    static withdrawApplication(req: Request<ApplicationIdParamDto, any, WithdrawApplicationDto>, res: Response): Promise<void>;
}
//# sourceMappingURL=application.C.controller.d.ts.map