import { ApiError } from '../errors/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { MESSAGE } from '../constants/messages.js';
import { asyncHandler } from '../helper/asyncHandler.js';
import { JwtHelper } from '../helper/jwt.helper.js';
export const authMiddleware = asyncHandler(async (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, MESSAGE.UNAUTHORIZED);
    }
    try {
        const decodedToken = await JwtHelper.verifyAccessToken(accessToken);
        req.user = decodedToken;
        next();
    }
    catch (error) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, MESSAGE.UNAUTHORIZED);
    }
});
//# sourceMappingURL=auth.middleware.js.map