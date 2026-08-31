import prisma from "../../../config/database.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { BadRequestError } from "../../../common/errors/BadRequestError.js";
import { ForbiddenError } from "../../../common/errors/ForbiddenError.js";
export class JobAssessmentRepository {
    static async findJobById(jobId) {
        return await prisma.job.findUnique({
            where: { id: jobId }
        });
    }
    static async validateJobWorkflowSupportsAssessments(jobId) {
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
        if (!job || !job.workflow)
            return;
        const hasAssessmentStage = job.workflow.stages.some((s) => {
            const name = (s.stageLibrary?.name || '').toLowerCase();
            const type = (s.stageLibrary?.type || '').toLowerCase();
            return name.includes('assessment') || name.includes('test') || name.includes('exam') || type.includes('assessment');
        });
        if (!hasAssessmentStage) {
            throw new BadRequestError(`The hiring workflow "${job.workflow.name}" assigned to this job does not contain any assessment stage. Assessments cannot be attached.`);
        }
    }
    static async findActiveCompanyMember(userId, companyId) {
        return await prisma.companyMember.findFirst({
            where: {
                userId,
                companyId,
                status: "ACTIVE"
            }
        });
    }
    static async findAssessmentById(assessmentId) {
        return await prisma.assessment.findFirst({
            where: {
                id: assessmentId,
                deletedAt: null
            }
        });
    }
    static async attachAssessmentsToJob(jobId, jobCompanyId, assessments) {
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
    static async findJobAssessmentsByJobId(jobId) {
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
    static async findJobAssessment(jobId, assessmentId) {
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
    static async syncJobAssessments(jobId, jobCompanyId, assessments) {
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
    static async removeJobAssessment(jobId, assessmentId) {
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
            await Promise.all(remaining.map((record) => tx.jobAssessment.update({
                where: {
                    jobId_assessmentId: {
                        jobId: record.jobId,
                        assessmentId: record.assessmentId
                    }
                },
                data: {
                    displayOrder: record.displayOrder - 1
                }
            })));
        });
    }
    static async reorderJobAssessments(jobId, updates) {
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
            await Promise.all(updates.map((update) => tx.jobAssessment.update({
                where: {
                    jobId_assessmentId: {
                        jobId,
                        assessmentId: update.assessmentId
                    }
                },
                data: {
                    displayOrder: update.displayOrder
                }
            })));
        });
    }
    static async findInvitationByApplicationAndAssessment(applicationId, assessmentId) {
        return await prisma.assessmentInvitation.findFirst({
            where: { applicationId, assessmentId }
        });
    }
    static async createAssessmentInvitation(data) {
        return await prisma.assessmentInvitation.create({
            data
        });
    }
    static async findApplicationForInvitation(applicationId) {
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
                        companyId: true,
                        jobAssessments: {
                            select: {
                                assessmentId: true,
                                assessment: {
                                    select: {
                                        id: true,
                                        title: true,
                                        status: true
                                    }
                                }
                            },
                            orderBy: {
                                displayOrder: "asc"
                            }
                        }
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
    static async findAssessmentForInvitation(assessmentId) {
        return await prisma.assessment.findUnique({
            where: { id: assessmentId, deletedAt: null }
        });
    }
    static async findCandidateInvitations(candidateId) {
        return await prisma.assessmentInvitation.findMany({
            where: {
                application: {
                    candidateId
                }
            },
            orderBy: {
                createdAt: "desc"
            },
            include: {
                assessment: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        instructions: true,
                        durationMinutes: true,
                        passingScore: true,
                        totalMarks: true,
                        company: {
                            select: {
                                id: true,
                                companyName: true,
                                logo: true
                            }
                        }
                    }
                },
                application: {
                    select: {
                        id: true,
                        job: {
                            select: {
                                id: true,
                                title: true,
                                workplaceType: true,
                                location: true,
                                company: {
                                    select: {
                                        id: true,
                                        companyName: true,
                                        logo: true
                                    }
                                }
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
    static async findInvitationWithAttempt(applicationId) {
        return await prisma.assessmentInvitation.findFirst({
            where: { applicationId },
            orderBy: {
                createdAt: "desc"
            },
            include: {
                assessment: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        instructions: true,
                        durationMinutes: true,
                        passingScore: true,
                        totalMarks: true,
                        company: {
                            select: {
                                id: true,
                                companyName: true,
                                logo: true
                            }
                        }
                    }
                },
                application: {
                    select: {
                        id: true,
                        job: {
                            select: {
                                id: true,
                                title: true,
                                workplaceType: true,
                                location: true,
                                company: {
                                    select: {
                                        id: true,
                                        companyName: true,
                                        logo: true
                                    }
                                }
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
    static async findInvitationByToken(token) {
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
    static async findInvitationById(id) {
        return await prisma.assessmentInvitation.findUnique({
            where: { id },
            include: {
                assessment: {
                    select: {
                        id: true,
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
    static async updateInvitationStatus(id, status) {
        return await prisma.assessmentInvitation.update({
            where: { id },
            data: { status }
        });
    }
    static async findInvitationByIdempotencyKey(idempotencyKey) {
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
    static async createAssessmentAttempt(data) {
        return await prisma.assessmentAttempt.create({
            data
        });
    }
}
//# sourceMappingURL=assessmentAssignment.repository.js.map