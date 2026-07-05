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

    static logout = asyncHandler(
        async (req: Request, res: Response) =>{
            
            const refreshToken = req.cookies.refreshToken;
            await AuthService.logout(refreshToken);
            res.clearCookie("refreshToken");
            res.clearCookie("accessToken");
            
            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, MESSAGE.LOGOUT_SUCCESS, null)
            );
        }
    )

    static logoutAllDevices = asyncHandler(
        async (req: Request, res: Response) =>{
            
            const userId = req.user?.id;
            await AuthService.logoutAllDevices(userId);
            res.clearCookie("refreshToken");
            res.clearCookie("accessToken");

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, MESSAGE.LOGOUT_SUCCESS, null)
            );
        }
    )

    static logoutAllDevicesByEmail = asyncHandler(
        async (req:Request, res: Response) =>{
            
            await AuthService.logoutAllDevicesByEmail(req.body);
            
            res.clearCookie("refreshToken");
            res.clearCookie("accessToken");
            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, MESSAGE.LOGOUT_SUCCESS, null)
            );
        }
    )

    static getMe = asyncHandler(
        async (req: Request, res: Response) =>{
            const userId = req.user?.id;
            const user = await AuthService.getMe(userId);
            
            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, MESSAGE.SUCCESS, user)
            );
        }
    )

    static refreshToken = asyncHandler(
        async(req: Request, res: Response) =>{
            const refreshToken = await AuthService.newRefreshToken(req.cookies.refreshToken);

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, MESSAGE.SUCCESS, refreshToken)
            );
        }
    )

    static changePassword = asyncHandler(
        async(req: Request, res: Response) =>{
            const userId = req.user?.id

            await AuthService.changePassword(userId, req.body.oldPassword, req.body.newPassword);

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, MESSAGE.SUCCESS, null)
            );
        }
    )

    static forgotPassword = asyncHandler(
        async(req: Request, res: Response) =>{
            await AuthService.forgotPassword(req.body.email);

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, MESSAGE.SUCCESS, null)
            );
        }
    )

    static verifyOtp = asyncHandler(
        async(req: Request, res: Response) =>{
            const resetPasswordToken = await AuthService.verifyOtp(req.body);

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, MESSAGE.SUCCESS, resetPasswordToken)
            );
        }
    )

    static resetPassword = asyncHandler(
        async(req: Request, res: Response) =>{
            await AuthService.resetPassword(req.body.token, req.body.newPassword);

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, MESSAGE.SUCCESS, null)
            );
        }
    )
}