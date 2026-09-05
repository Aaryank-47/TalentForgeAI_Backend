import type { NextFunction, Request, Response } from "express";
import { CompanyRepository } from "../../modules/company/repository/company.repository.js";
import { ConflictError } from "../errors/ConflictError.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { CompanyStatus } from "@prisma/client";


export const ensureActiveCompany = async (
    req: Request<{ companyId: string }>,
    res: Response,
    next: NextFunction
) => {
    const company = await CompanyRepository.getRawCompanyById(req.params.companyId as string);

    if (!company) {
        throw new NotFoundError("Company not found.");
    }

    if (company.deletedAt) {
        throw new ConflictError("Company has been deleted.");
    }

    if (company.status !== CompanyStatus.ACTIVE) {
        throw new ConflictError("Company is not active.");
    }

    req.company = company;

    next();
};