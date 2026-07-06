import express from 'express';
import type { Application, Request, Response } from 'express';

import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import apiRouter from './routes/index.js';
import compression from 'compression';

import { requestLogger } from './common/middleware/requestLogger.middleware.js'
import { notFoundMiddleware } from './common/middleware/notFound.middleware.js'
import { errorMiddleware } from './common/middleware/error.middleware.js';
import { globalRateLimiter } from "./common/middleware/rateLimit.middleware.js";


const app: Application = express();


app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);
app.use(morgan("dev"));
app.use(globalRateLimiter);

app.get('/', (req: Request, res: Response) => {
    res.json({
        success: true,
        message: "TalentForge AI Backend Running"
    })
})

app.use("/api/v1", apiRouter);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;