import prisma from "../../../config/database.js";
import type { Job, Assessment, CompanyMember } from "@prisma/client";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { BadRequestError } from "../../../common/errors/BadRequestError.js";
import { ForbiddenError } from "../../../common/errors/ForbiddenError.js";

export class JobAssessmentRepository {
    static async findJobById(jobId: string): Promise<Job | null> {
        return await prisma.job.findUnique({
            where: { id: jobId }
        });
    }

    static async findActiveCompanyMember(userId: string, companyId: string): Promise<CompanyMember | null> {
        return await prisma.companyMember.findFirst({
            where: {
                userId,
                companyId,
                status: "ACTIVE"
            }
        });
    }

    static async findAssessmentById(assessmentId: string): Promise<Assessment | null> {
        return await prisma.assessment.findFirst({
            where: {
                id: assessmentId,
                deletedAt: null
            }
        });
    }

    static async attachAssessmentsToJob(
        jobId: string,
        jobCompanyId: string,
        assessments: { assessmentId: string; displayOrder: number; isMandatory: boolean }[]
    ): Promise<number> {
        return await prisma.$transaction(async (tx) => {
            let assignedCount = 0;
            for (const item of assessments) {
                const assessment = await tx.assessment.findFirst({
                    where: { id: item.assessmentId, deletedAt: null }
                });
                if (!assessment) {
                    throw new NotFoundError(`Assessment not found: ${item.assessmentId}`);
                }
                if (assessment.status !== "PUBLISHED") {
                    throw new BadRequestError(`Assessment "${assessment.title}" is not published`);
                }
                if (assessment.companyId !== jobCompanyId) {
                    throw new ForbiddenError(`Assessment "${assessment.title}" does not belong to the company owning this job`);
                }
                const existing = await tx.jobAssessment.findUnique({
                    where: {
                        jobId_assessmentId: {
                            jobId,
                            assessmentId: item.assessmentId
                        }
                    }
                });

                if (!existing) {
                    await tx.jobAssessment.create({
                        data: {
                            jobId,
                            assessmentId: item.assessmentId,
                            displayOrder: item.displayOrder,
                            isMandatory: item.isMandatory
                        }
                    });
                    assignedCount++;
                } else {
                    await tx.jobAssessment.update({
                        where: {
                            jobId_assessmentId: {
                                jobId,
                                assessmentId: item.assessmentId
                            }
                        },
                        data: {
                            displayOrder: item.displayOrder,
                            isMandatory: item.isMandatory
                        }
                    });
                    assignedCount++;
                }
            }
            return assignedCount;
        });
    }
}
