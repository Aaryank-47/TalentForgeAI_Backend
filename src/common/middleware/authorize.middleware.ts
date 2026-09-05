import { MESSAGE } from '../constants/messages.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import type { Request, Response, NextFunction } from 'express';
import { UserRole } from "@prisma/client";

export const authorize = (
    (...roles: UserRole[]) =>
        (
            req: Request,
            res: Response,
            next: NextFunction
        ) =>{
            const user = req.user;
            if (!user) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    message: MESSAGE.UNAUTHORIZED
                });
            }

            const isBaseUserRole = user.role === UserRole.CANDIDATE || user.role === UserRole.EMPLOYER;
            const routeRequiresBaseRole = roles.includes(UserRole.CANDIDATE) || roles.includes(UserRole.EMPLOYER);

            if (!roles.includes(user.role)) {
                // Relax base role checks: if user has a base role and the route requires a base role,
                // let it pass. The actual capability enforcement (e.g. Candidate Profile exists, or 
                // Company Membership is active) happens in the specific capability middlewares.
                if (isBaseUserRole && routeRequiresBaseRole) {
                    return next();
                }

                return res.status(HTTP_STATUS.FORBIDDEN).json({
                    message: MESSAGE.UNAUTHORIZED
                });
            }
            
            next();
        }
)
