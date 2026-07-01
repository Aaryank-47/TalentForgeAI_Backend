import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import prisma from './config/database.js';
const app = express();
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: "TalentForge AI Backend Running"
    });
});
app.get('/health/db', async (_req, res) => {
    try {
        await prisma.$queryRawUnsafe('SELECT 1');
        res.json({
            success: true,
            message: 'Database connection is healthy'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Database connection failed'
        });
    }
});
export default app;
//# sourceMappingURL=app.js.map