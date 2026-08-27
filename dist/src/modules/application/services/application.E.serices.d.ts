import type { ApplicationListResult, ApplicationDetailResult } from "../interfaces/application.interface.js";
export declare class EmployerApplicationService {
    static getCompanyApplications(userId: string, companyId: string, query: {
        page: number;
        limit: number;
        jobId?: string | undefined;
        status?: string | undefined;
        search?: string | undefined;
    }): Promise<ApplicationListResult>;
    static getJobApplications(userId: string, jobId: string, query: {
        page: number;
        limit: number;
        status?: string | undefined;
        search?: string | undefined;
    }): Promise<ApplicationListResult>;
    static getJobApplicationDetails(userId: string, applicationId: string): Promise<ApplicationDetailResult>;
}
//# sourceMappingURL=application.E.serices.d.ts.map