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

    static login = asyncHandler(
        async (req: Request, res: Response) => {
            const login = await AuthService.login(req.body);

            res.cookie("refreshToken",login.tokens.refreshToken,{
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 30 * 24 * 60 * 60 * 1000,
            })
            res.cookie("accessToken",login.tokens.accessToken,{
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 30 * 24 * 60 * 60 * 1000,
            })

            const { tokens, ...loginWithoutTokens } = login;

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, MESSAGE.LOGIN_SUCCESS, loginWithoutTokens)
            );
        }
    );

    static refreshToken = asyncHandler(
        async(req: Request, res: Response) =>{
            const refreshToken = await AuthService.newRefreshToken(req.cookies.refreshToken);

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, MESSAGE.SUCCESS, refreshToken)
            );
        }
    )
}