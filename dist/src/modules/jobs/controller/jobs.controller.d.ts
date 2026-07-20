import type { Request, Response } from "express";
export declare class JobController {
    static createJob(req: Request, res: Response): Promise<void>;
    static listCompanyJobs(req: Request, res: Response): Promise<void>;
    static getJobDetails(req: Request, res: Response): Promise<void>;
    static updateJobDetails(req: Request, res: Response): Promise<void>;
    static updateJobStatus(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=jobs.controller.d.ts.map