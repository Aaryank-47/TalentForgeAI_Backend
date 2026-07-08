import { MESSAGE } from '../constants/messages.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { JwtHelper } from '../helper/jwt.helper.js';
import { UserRole } from "@prisma/client";
export const authorize = ((...roles) => (req, res, next) => {
    const user = req.user;
    if (!user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            message: MESSAGE.UNAUTHORIZED
        });
    }
    if (!roles.includes(user.role)) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
            message: MESSAGE.UNAUTHORIZED
        });
    }
    next();
});
//# sourceMappingURL=authorize.middleware.js.map