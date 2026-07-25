import type { Request, Response } from "express";
import { asyncHandler } from "../../../common/helper/asyncHandler.js";
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { ApiResponse } from "../../../common/utils/ApiResponse.js";
import { StageLibServices } from "../services/stage-library.service.js";

export class StageLibController {
    static createCustomStage = asyncHandler(
        async (req: Request, res: Response) => {
            const newStage = await StageLibServices.createCustomStage({
                ...req.body,
                companyId: req.params.companyId,
            });

            res.status(HTTP_STATUS.CREATED).json(
                new ApiResponse(true, "Custom stage created successfully", newStage)
            );
        }
    );
}
