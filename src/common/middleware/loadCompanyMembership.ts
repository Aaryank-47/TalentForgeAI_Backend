import type { NextFunction, Request, Response } from "express";
import { CompanyRepository } from "../../modules/company/repository/company.repository.js";
import { UnauthorizedError } from "../../common/errors/UnauthorizedError.js";
import { ForbiddenError } from "../../common/errors/ForbiddenError.js";
import { NotFoundError } from "../../common/errors/NotFoundError.js";
import { CompanyMemberStatus } from "@prisma/client";

export const loadCompanyMembership = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user;

        if (!user) {
            throw new UnauthorizedError("Unauthorized access.");
        }

        const companyId = req.params.companyId;

        if (!companyId) {
            throw new NotFoundError("Company id is required.");
        }
        const membership = await CompanyRepository.membership(
            companyId as string,
            user.id
        );

        if (!membership) {
            throw new ForbiddenError(
                "You are not a member of this company."
            );
        }

        if (membership.status !== CompanyMemberStatus.ACTIVE) {
            throw new ForbiddenError(
                "Your company membership is inactive."
            );
        }

        req.companyMember = membership;

        next();
    } catch (error) {
        next(error);
    }
};