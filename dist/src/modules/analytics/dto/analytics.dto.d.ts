import { z } from "zod";
export declare const analyticsQueryDto: z.ZodObject<{
    period: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        "Last 6 Months": "Last 6 Months";
        "30d": "30d";
        "Last 30 Days": "Last 30 Days";
        "3m": "3m";
        "Last 3 Months": "Last 3 Months";
        "6m": "6m";
        "1y": "1y";
        "This Year": "This Year";
    }>>>;
    jobId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const dashboardQueryDto: z.ZodObject<{
    timeframe: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        "30d": "30d";
        "7d": "7d";
        "Last 30 days": "Last 30 days";
        "Last 7 days": "Last 7 days";
    }>>>;
}, z.core.$strip>;
export type AnalyticsQueryDto = z.infer<typeof analyticsQueryDto>;
export type DashboardQueryDto = z.infer<typeof dashboardQueryDto>;
//# sourceMappingURL=analytics.dto.d.ts.map