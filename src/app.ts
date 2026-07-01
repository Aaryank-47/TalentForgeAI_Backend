import express from 'express';
import type { Application, Request, Response } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import prisma from './config/database.js';
import compression from 'compression';

const app: Application = express();


app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get('/', (req: Request, res: Response) => {
    res.json({
        success: true,
        message: "TalentForge AI Backend Running"
    })
})

app.get('/health/db', async (_req: Request, res: Response) => {
    try {
        await prisma.$queryRawUnsafe('SELECT 1');

        res.json({
            success: true,
            message: 'Database connection is healthy'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Database connection failed'
        });
    }
});

export default app;