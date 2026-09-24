import type { Request, Response, NextFunction } from "express";

export function performanceMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
){
    const start = performance.now();

    res.on("finish",()=>{
        const duration = performance.now() - start;
        console.log(`[PERFORMANCE] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration.toFixed(2)}ms`)
    })

    next();
}