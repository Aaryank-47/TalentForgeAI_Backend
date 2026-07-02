// import { pinoHttp } from "pino-http";
// import { logger } from "../logger/logger.js";

// export const requestLogger = pinoHttp({
//     logger,
// });

import {pinoHttp} from "pino-http";

import { logger } from "../logger/logger.js";

export const requestLogger = pinoHttp({
    logger,

    customSuccessMessage(req, res) {
        return `${req.method} ${req.url} ${res.statusCode}`;
    },

    customErrorMessage(req, res, error) {
        return `${req.method} ${req.url} ${res.statusCode} - ${error.message}`;
    },

    serializers: {
        req() {
            return undefined;
        },

        res() {
            return undefined;
        },
    },
});