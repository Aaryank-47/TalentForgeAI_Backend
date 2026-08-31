import { z } from "zod";
export const analyticsQueryDto = z.object({
    period: z
        .enum([
        "30d",
        "3m",
        "6m",
        "1y",
        "Last 30 Days",
        "Last 3 Months",
        "Last 6 Months",
        "This Year",
    ])
        .optional()
        .default("Last 6 Months"),
    jobId: z.string().optional(),
});
export const dashboardQueryDto = z.object({
    timeframe: z
        .enum(["7d", "30d", "Last 7 days", "Last 30 days"])
        .optional()
        .default("7d"),
});
//# sourceMappingURL=analytics.dto.js.map