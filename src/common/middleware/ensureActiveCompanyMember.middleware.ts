import type { NextFunction, Request, Response } from "express";
import prisma from "../../config/database.js";
import { CompanyRepository } from "../../modules/company/repository/company.repository.js";
import { ForbiddenError } from "../errors/ForbiddenError.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import { CompanyMemberStatus, UserRole } from "@prisma/client";

export const ensureActiveCompanyMember = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user;
        if (!user) {
            throw new UnauthorizedError("Unauthorized access.");
        }

        let companyId: string | undefined;

        if (typeof req.params.companyId === "string") {
            companyId = req.params.companyId;
        } else if (req.body && typeof req.body.companyId === "string") {
            companyId = req.body.companyId;
        } else if (req.query && typeof req.query.companyId === "string") {
            companyId = req.query.companyId;
        }

        const assessmentId = typeof req.params.assessmentId === "string" ? req.params.assessmentId : undefined;
        if (!companyId && assessmentId) {
            const assessment = await prisma.assessment.findFirst({
                where: { id: assessmentId, deletedAt: null },
                select: { companyId: true }
            });
            if (!assessment) {
                throw new NotFoundError("Assessment not found.");
            }
            companyId = assessment.companyId;
        }

        if (!companyId) {
            throw new NotFoundError("Company ID is required.");
        }

        let membership = await CompanyRepository.findMemberByUserAndCompany(user.id, companyId as string);

        if (!membership) {
            if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
                membership = await prisma.companyMember.create({
                    data: {
                        userId: user.id,
                        companyId: companyId as string,
                        role: "ADMIN",
                        status: "ACTIVE"
                    }
                });
            } else {
                throw new ForbiddenError("You are not a member of this company.");
            }
        }

        if (membership.status !== CompanyMemberStatus.ACTIVE) {
            throw new ForbiddenError("Your company membership is inactive.");
        }

        req.companyMember = membership;
        next();
    } catch (error) {
        next(error);
    }
};
