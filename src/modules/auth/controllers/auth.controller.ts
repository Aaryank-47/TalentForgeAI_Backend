import type { Request, Response } from "express";
import { asyncHandler } from "../../../common/helper/asyncHandler.js";
import { HTTP_STATUS } from "../../../common/constants/httpStatus.js";
import { MESSAGE } from "../../../common/constants/messages.js";
import { ApiResponse } from "../../../common/utils/ApiResponse.js";
import { AuthService } from "../services/auth.service.js";

export class AuthController {
    static registerCandidate = asyncHandler(
        async (req: Request, res: Response) => {
            const registration = await AuthService.registerCandidate(req.body);

            res.status(HTTP_STATUS.CREATED).json(
                new ApiResponse(true, MESSAGE.REGISTER_SUCCESS, registration)
            );
        }
    );

    static registerRecruiter = asyncHandler(
        async (req: Request, res: Response) => {
            const registration = await AuthService.registerRecruiter(req.body);

            res.status(HTTP_STATUS.CREATED).json(
                new ApiResponse(true, MESSAGE.REGISTER_SUCCESS, registration)
            );
        }
    );
}