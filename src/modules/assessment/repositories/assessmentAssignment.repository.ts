import prisma from "../../../config/database.js";
import type { Job, Assessment, CompanyMember, Prisma } from "@prisma/client";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { BadRequestError } from "../../../common/errors/BadRequestError.js";
import { ForbiddenError } from "../../../common/errors/ForbiddenError.js";

export class JobAssessmentRepository {
    static async findJobById(jobId: string): Promise<Job | null> {
        return await prisma.job.findUnique({
            where: { id: jobId }
        });
    }

    static async validateJobWorkflowSupportsAssessments(jobId: string): Promise<void> {
        const job = await prisma.job.findUnique({
            where: { id: jobId },
            select: {
                id: true,
                workflow: {
                    select: {
                        id: true,
                        name: true,
                        stages: {
                            select: {
                                stageLibrary: {
                                    select: {
                                        name: true,
                                        type: true,
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!job || !job.workflow) return;

        const hasAssessmentStage = job.workflow.stages.some((s) => {
            const name = (s.stageLibrary?.name || '').toLowerCase();
            const type = (s.stageLibrary?.type || '').toLowerCase();
            return name.includes('assessment') || name.includes('test') || name.includes('exam') || type.includes('assessment');
        });

        if (!hasAssessmentStage) {
            throw new BadRequestError(
                `The hiring workflow "${job.workflow.name}" assigned to this job does not contain any assessment stage. Assessments cannot be attached.`
            );
        }
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
            orderBy: {
                displayOrder: "asc"
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

    static async findInvitationByApplicationAndAssessment(applicationId: string, assessmentId: string) {
        return await prisma.assessmentInvitation.findFirst({
            where: { applicationId, assessmentId }
        });
    }

    static async createAssessmentInvitation(data: Prisma.AssessmentInvitationUncheckedCreateInput) {
        return await prisma.assessmentInvitation.create({
            data
        });
    }

    static async findApplicationForInvitation(applicationId: string) {
        return await prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                candidate: {
                    select: {
                        fullName: true,
                        user: {
                            select: {
                                email: true
                            }
                        }
                    }
                },
                job: {
                    select: {
                        companyId: true
                    }
                },
                applicationWorkflow: {
                    include: {
                        workflowStage: {
                            select: {
                                assessmentId: true
                            }
                        }
                    }
                },
                assessmentInvitations: {
                    orderBy: {
                        createdAt: "desc"
                    }
                }
            }
        });
    }

    static async findAssessmentForInvitation(assessmentId: string) {
        return await prisma.assessment.findUnique({
            where: { id: assessmentId, deletedAt: null }
        });
    }

    static async findInvitationWithAttempt(applicationId: string) {
        return await prisma.assessmentInvitation.findFirst({
            where: { applicationId },
            include: {
                assessment: {
                    select: {
                        title: true
                    }
                },
                application: {
                    include: {
                        assessmentAttempts: {
                            orderBy: {
                                createdAt: "desc"
                            },
                            take: 1
                        }
                    }
                }
            }
        });
    }

    static async findInvitationByToken(token: string) {
        return await prisma.assessmentInvitation.findUnique({
            where: { token },
            include: {
                assessment: {
                    select: {
                        id: true,
                        title: true,
                        durationMinutes: true,
                        companyId: true
                    }
                },
                application: {
                    include: {
                        candidate: {
                            select: {
                                fullName: true
                            }
                        },
                        assessmentAttempts: {
                            orderBy: {
                                createdAt: "desc"
                            },
                            take: 1
                        }
                    }
                }
            }
        });
    }

    static async findInvitationById(id: string) {
        return await prisma.assessmentInvitation.findUnique({
            where: { id },
            include: {
                assessment: {
                    select: {
                        title: true,
                        companyId: true
                    }
                },
                application: {
                    include: {
                        candidate: {
                            select: {
                                fullName: true,
                                user: {
                                    select: {
                                        email: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    static async updateInvitationStatus(
        id: string, 
        status: any
    ) {
        return await prisma.assessmentInvitation.update({
            where: { id },
            data: { status }
        });
    }

    static async findInvitationByIdempotencyKey(idempotencyKey: string) {
        return await prisma.assessmentInvitation.findUnique({
            where: { idempotencyKey },
            include: {
                assessment: {
                    select: {
                        id: true,
                        companyId: true
                    }
                }
            }
        });
    }

    static async createAssessmentAttempt(data: any) {
        return await prisma.assessmentAttempt.create({
            data
        });
    }
}
