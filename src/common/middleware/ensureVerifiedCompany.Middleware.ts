import type { Request, Response, NextFunction } from "express";
import { ConflictError } from "../errors/ConflictError.js";

export const ensureVerifiedCompany = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.company?.isVerified) {
        throw new ConflictError(
            "Company must be verified."
        );
    }

    next();
};