import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { AnalyticsService } from "../services/analytics.service.js";

export class AnalyticsController {
  static async getOverview(req: Request, res: Response) {
    const companyId = req.params.companyId as string;
    const period = (req.query.period as string) || "Last 6 Months";

    const overview = await AnalyticsService.getOverview(companyId, period);

    res.status(HTTP_STATUS.OK).json({
      status: "success",
      message: "Analytics overview retrieved successfully",
      data: overview,
    });
  }

  static async getDashboard(req: Request, res: Response) {
    const companyId = req.params.companyId as string;
    const timeframe = (req.query.timeframe as string) || "7d";

    const dashboard = await AnalyticsService.getDashboard(companyId, timeframe);

    res.status(HTTP_STATUS.OK).json({
      status: "success",
      message: "Recruiter dashboard data retrieved successfully",
      data: dashboard,
    });
  }
}
