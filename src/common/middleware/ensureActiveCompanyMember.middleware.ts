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

        let assessmentId = typeof req.params.assessmentId === "string" ? req.params.assessmentId : undefined;
        if (!assessmentId && req.body && typeof req.body.assessmentId === "string") {
            assessmentId = req.body.assessmentId;
        }

        let sectionId = typeof req.params.sectionId === "string" ? req.params.sectionId : undefined;
        if (!sectionId && req.body && typeof req.body.sectionId === "string") {
            sectionId = req.body.sectionId;
        }

        let sectionItemId = typeof req.params.sectionItemId === "string" ? req.params.sectionItemId : undefined;
        if (!sectionItemId && req.body && typeof req.body.sectionItemId === "string") {
            sectionItemId = req.body.sectionItemId;
        }

        let jobId = typeof req.params.jobId === "string" ? req.params.jobId : undefined;
        if (!jobId && req.body && typeof req.body.jobId === "string") {
            jobId = req.body.jobId;
        }

        if (!companyId) {
            if (assessmentId) {
                const assessment = await prisma.assessment.findFirst({
                    where: { id: assessmentId, deletedAt: null },
                    select: { companyId: true }
                });
                if (!assessment) {
                    throw new NotFoundError("Assessment not found.");
                }
                companyId = assessment.companyId;
            } else if (sectionId) {
                const section = await prisma.assessmentSection.findFirst({
                    where: { id: sectionId, assessment: { deletedAt: null } },
                    include: { assessment: { select: { companyId: true } } }
                });
                if (!section) {
                    throw new NotFoundError("Section not found.");
                }
                companyId = section.assessment.companyId;
            } else if (sectionItemId) {
                const item = await prisma.assessmentSectionItem.findFirst({
                    where: { id: sectionItemId, section: { assessment: { deletedAt: null } } },
                    include: {
                        section: {
                            include: {
                                assessment: { select: { companyId: true } }
                            }
                        }
                    }
                });
                if (!item) {
                    throw new NotFoundError("Section item not found.");
                }
                companyId = item.section.assessment.companyId;
            } else if (jobId) {
                const job = await prisma.job.findFirst({
                    where: { id: jobId },
                    select: { companyId: true }
                });
                if (!job) {
                    throw new NotFoundError("Job not found.");
                }
                companyId = job.companyId;
            }
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
