import { pinoHttp } from "pino-http";
import { logger } from "../logger/logger.js";
export const requestLogger = pinoHttp({
    logger,
});
//# sourceMappingURL=requestLogger.middleware.js.map