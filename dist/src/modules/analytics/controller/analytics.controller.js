import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { AnalyticsService } from "../services/analytics.service.js";
export class AnalyticsController {
    static async getOverview(req, res) {
        const companyId = req.params.companyId;
        const period = req.query.period || "Last 6 Months";
        const overview = await AnalyticsService.getOverview(companyId, period);
        res.status(HTTP_STATUS.OK).json({
            status: "success",
            message: "Analytics overview retrieved successfully",
            data: overview,
        });
    }
    static async getDashboard(req, res) {
        const companyId = req.params.companyId;
        const timeframe = req.query.timeframe || "7d";
        const dashboard = await AnalyticsService.getDashboard(companyId, timeframe);
        res.status(HTTP_STATUS.OK).json({
            status: "success",
            message: "Recruiter dashboard data retrieved successfully",
            data: dashboard,
        });
    }
}
//# sourceMappingURL=analytics.controller.js.map