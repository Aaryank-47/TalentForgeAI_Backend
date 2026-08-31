import type { AnalyticsOverviewResponse, RecruiterDashboardResponse } from "../types/analytics.types.js";
export declare class AnalyticsService {
    private static parsePeriod;
    static getOverview(companyId: string, periodQuery?: string): Promise<AnalyticsOverviewResponse>;
    static getDashboard(companyId: string, timeframeQuery?: string): Promise<RecruiterDashboardResponse>;
}
//# sourceMappingURL=analytics.service.d.ts.map