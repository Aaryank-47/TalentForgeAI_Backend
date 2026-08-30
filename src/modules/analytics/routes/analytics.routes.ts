import { Router } from "express";
import { AnalyticsController } from "../controller/analytics.controller.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";
import { authorize } from "../../../common/middleware/authorize.middleware.js";
import { UserRole } from "@prisma/client";
import { loadCompanyMembership } from "../../../common/middleware/loadCompanyMembership.middleware.js";
import { validate } from "../../../common/middleware/validate.middleware.js";
import { analyticsQueryDto, dashboardQueryDto } from "../dto/analytics.dto.js";

const router = Router();

// Recruiter Dashboard endpoints
router.get(
  "/:companyId/dashboard",
  authMiddleware,
  authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  loadCompanyMembership,
  validate(dashboardQueryDto, "query"),
  AnalyticsController.getDashboard
);

router.get(
  "/dashboard",
  authMiddleware,
  authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  loadCompanyMembership,
  validate(dashboardQueryDto, "query"),
  AnalyticsController.getDashboard
);

// Analytics Overview endpoints
router.get(
  "/:companyId/overview",
  authMiddleware,
  authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  loadCompanyMembership,
  validate(analyticsQueryDto, "query"),
  AnalyticsController.getOverview
);

router.get(
  "/overview",
  authMiddleware,
  authorize(UserRole.EMPLOYER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  loadCompanyMembership,
  validate(analyticsQueryDto, "query"),
  AnalyticsController.getOverview
);

export default router;
