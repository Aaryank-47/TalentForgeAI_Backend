import prisma from "../../../config/database.js";
import type { Job, Assessment, CompanyMember, JobAssessment } from "@prisma/client";
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
        assessments: { assessmentId: string; displayOrder?: number | undefined; isMandatory?: boolean | undefined }[]
    ): Promise<number> {
        return await prisma.$transaction(async (tx) => {
            const assessmentIds = assessments.map((a) => a.assessmentId);
            const fetchedAssessments = await tx.assessment.findMany({
                where: {
                    id: { in: assessmentIds },
                    deletedAt: null
                }
            });

            const assessmentMap = new Map(fetchedAssessments.map((a) => [a.id, a]));

            for (const id of assessmentIds) {
                const assessment = assessmentMap.get(id);
                if (!assessment) {
                    throw new NotFoundError(`Assessment not found: ${id}`);
                }
                if (assessment.status !== "PUBLISHED") {
                    throw new BadRequestError(`Assessment "${assessment.title}" is not published`);
                }
                if (assessment.companyId !== jobCompanyId) {
                    throw new ForbiddenError(`Assessment "${assessment.title}" does not belong to the company owning this job`);
                }
            }

            await tx.jobAssessment.deleteMany({
                where: {
                    jobId,
                    assessmentId: { in: assessmentIds }
                }
            });

            let displayOrderCounter = 1;
            const data = assessments.map((item) => ({
                jobId,
                assessmentId: item.assessmentId,
                displayOrder: item.displayOrder ?? displayOrderCounter++,
                isMandatory: item.isMandatory ?? true
            }));

            const { count } = await tx.jobAssessment.createMany({
                data
            });

            return count;
        });
    }

    static async findJobAssessmentsByJobId(jobId: string) {
        return await prisma.jobAssessment.findMany({
            where: {
                jobId,
                assessment: {
                    deletedAt: null
                }
            },
            include: {
                assessment: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        durationMinutes: true
                    }
                }
            }
        });
    }

    static async findJobAssessment(jobId: string, assessmentId: string) {
        return await prisma.jobAssessment.findUnique({
            where: {
                jobId_assessmentId: {
                    jobId,
                    assessmentId
                }
            },
            include: {
                assessment: true
            }
        });
    }

    static async syncJobAssessments(
        jobId: string,
        jobCompanyId: string,
        assessments: { assessmentId: string; displayOrder?: number | undefined; isMandatory?: boolean | undefined }[]
    ): Promise<number> {
        return await prisma.$transaction(async (tx) => {
            const assessmentIds = assessments.map((a) => a.assessmentId);
            const fetchedAssessments = await tx.assessment.findMany({
                where: {
                    id: { in: assessmentIds },
                    deletedAt: null
                }
            });

            const assessmentMap = new Map(fetchedAssessments.map((a) => [a.id, a]));

            for (const id of assessmentIds) {
                const assessment = assessmentMap.get(id);
                if (!assessment) {
                    throw new NotFoundError(`Assessment not found: ${id}`);
                }
                if (assessment.status !== "PUBLISHED") {
                    throw new BadRequestError(`Assessment "${assessment.title}" is not published`);
                }
                if (assessment.companyId !== jobCompanyId) {
                    throw new ForbiddenError(`Assessment "${assessment.title}" does not belong to the company owning this job`);
                }
            }

            await tx.jobAssessment.deleteMany({
                where: { jobId }
            });
            let displayOrderCounter = 1;
            const data = assessments.map((item, index) => ({
                jobId,
                assessmentId: item.assessmentId,
                displayOrder: item.displayOrder ?? displayOrderCounter++,
                isMandatory: item.isMandatory ?? true
            }));
            const { count } = await tx.jobAssessment.createMany({
                data
            });

            return count;
        });
    }

    static async removeJobAssessment(jobId: string, assessmentId: string): Promise<void> {
        await prisma.$transaction(async (tx) => {
            const deleted = await tx.jobAssessment.delete({
                where: {
                    jobId_assessmentId: {
                        jobId,
                        assessmentId
                    }
                }
            });

            const remaining = await tx.jobAssessment.findMany({
                where: {
                    jobId,
                    displayOrder: {
                        gt: deleted.displayOrder
                    }
                }
            });

            await Promise.all(
                remaining.map((record) =>
                    tx.jobAssessment.update({
                        where: {
                            jobId_assessmentId: {
                                jobId: record.jobId,
                                assessmentId: record.assessmentId
                            }
                        },
                        data: {
                            displayOrder: record.displayOrder - 1
                        }
                    })
                )
            );
        });
    }

    static async reorderJobAssessments(
        jobId: string,
        updates: { assessmentId: string; displayOrder: number }[]
    ): Promise<void> {
        await prisma.$transaction(async (tx) => {
            const assessmentIds = updates.map((u) => u.assessmentId);

            const existing = await tx.jobAssessment.findMany({
                where: {
                    jobId,
                    assessmentId: { in: assessmentIds }
                }
            });

            if (existing.length !== updates.length) {
                throw new NotFoundError("One or more job assessment relations were not found");
            }

            await Promise.all(
                updates.map((update) =>
                    tx.jobAssessment.update({
                        where: {
                            jobId_assessmentId: {
                                jobId,
                                assessmentId: update.assessmentId
                            }
                        },
                        data: {
                            displayOrder: update.displayOrder
                        }
                    })
                )
            );
        });
    }
}
