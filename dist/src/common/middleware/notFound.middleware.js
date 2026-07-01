import { HTTP_STATUS } from '../constants/httpStatus.js';
export const notFoundMiddleware = (req, res) => {
    res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
};
//# sourceMappingURL=notFound.middleware.js.map