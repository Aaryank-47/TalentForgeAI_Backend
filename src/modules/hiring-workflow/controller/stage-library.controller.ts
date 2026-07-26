import type { Request, Response } from "express";
import { asyncHandler } from "../../../common/helper/asyncHandler.js";
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { MESSAGE } from "../../../common/constants/messages.js";
import { ApiResponse } from "../../../common/utils/ApiResponse.js";
import { StageLibServices } from "../services/stage-library.service.js";


export class StageLibController {
    static createSystemStages = asyncHandler(
        async (
            req: Request,
            res: Response
        )=>{
            const { name , type } = req.body;
            const newSystemStage = await StageLibServices.createSystemStage(name, type);
            res.status(HTTP_STATUS.CREATED).json(
                new ApiResponse(true, "System stage created successfully", newSystemStage)
            );
        }
    )

    static createCustomStage = asyncHandler(
        async (
            req: Request, 
            res: Response
        ) => {
            const newStage = await StageLibServices.createCustomStage({
                ...req.body,
                companyId: req.params.companyId,
            });

            res.status(HTTP_STATUS.CREATED).json(
                new ApiResponse(true, "Custom stage created successfully", newStage)
            );
        }
    );

    static getAllsystemAndCustomStages = asyncHandler(
        async (
            req: Request,
            res: Response
        )=>{
            const {companyId} = req.params;
            const allStages = await StageLibServices.getCustomAndSystemStages(companyId as string);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MESSAGE.DATA_FETCHED_SUCCESSFULLY,
                data: allStages
            });
        }
    )
}
