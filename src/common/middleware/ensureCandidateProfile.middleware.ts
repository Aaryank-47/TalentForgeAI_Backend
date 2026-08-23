import type { NextFunction, Request, Response } from "express";
import prisma from "../../config/database.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import { ForbiddenError } from "../errors/ForbiddenError.js";

export const ensureCandidateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user;
        if (!user) {
            throw new UnauthorizedError("Unauthorized access.");
        }

        // Check if candidate profile exists for user
        const candidate = await prisma.candidate.findUnique({
            where: { userId: user.id },
            select: {
                id: true,
                userId: true,
                fullName: true,
                isOpenToWork: true,
            }
        });

        if (!candidate) {
            throw new ForbiddenError("Candidate profile not found. Please complete the \"Find a Job\" setup first.");
        }

        // Attach candidate to req for downstream controllers
        (req as any).candidate = candidate;
        next();
    } catch (error) {
        next(error);
    }
};
