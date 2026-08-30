import type { NextFunction, Request, Response } from "express";
import { CompanyRepository } from "../../modules/company/repository/company.repository.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import { ForbiddenError } from "../errors/ForbiddenError.js";
import { NotFoundError } from "../errors/NotFoundError.js";
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

        let companyId = req.params.companyId || (typeof req.headers["x-company-id"] === "string" ? req.headers["x-company-id"] : undefined);

        // If companyId in params is the literal string 'company' or empty, resolve from header or active user company
        if (!companyId || companyId === 'company' || companyId === 'default') {
            const headerCompanyId = typeof req.headers["x-company-id"] === "string" ? req.headers["x-company-id"] : undefined;
            if (headerCompanyId && headerCompanyId !== 'company' && headerCompanyId !== 'default') {
                companyId = headerCompanyId;
            } else {
                const activeMemberships = await CompanyRepository.findActiveMembershipsByUser(user.id);
                if (activeMemberships.length > 0 && activeMemberships[0]) {
                    companyId = activeMemberships[0].companyId;
                }
            }
        }

        if (!companyId) {
            throw new NotFoundError("Company id is required.");
        }
        let membership = await CompanyRepository.membership(
            companyId as string,
            user.id
        );

        if (!membership) {
            // Fallback: check if user has active membership in any company
            const activeMemberships = await CompanyRepository.findActiveMembershipsByUser(user.id);
            if (activeMemberships.length > 0 && activeMemberships[0]) {
                companyId = activeMemberships[0].companyId;
                membership = await CompanyRepository.membership(companyId, user.id);
            }
        }

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

        req.params.companyId = companyId;
        req.companyMember = membership;

        next();
    } catch (error) {
        next(error);
    }
};