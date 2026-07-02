import { HealthService } from "../services/health.services.js";
import { ApiResponse } from "../../../common/utils/ApiResponse.js";
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { MESSAGE } from "../../../common/constants/messages.js";
import { asyncHandler } from "../../../common/helper/asyncHandler.js";
export class HealthController {
    static serverHealth = asyncHandler(async (req, res) => {
        const healthStatus = await HealthService.checkServerHealth();
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, MESSAGE.SUCCESS, healthStatus));
    });
    static databaseHealth = asyncHandler(async (req, res) => {
        const healthStatus = await HealthService.checkDatabaseHealth();
        res.status(HTTP_STATUS.OK).json(new ApiResponse(true, MESSAGE.SUCCESS, healthStatus));
    });
}
//# sourceMappingURL=health.controller.js.map