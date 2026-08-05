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
            let assignedCount = 0;
            for (const item of assessments) {
                // Find Assessment
                const assessment = await tx.assessment.findFirst({
                    where: { id: item.assessmentId, deletedAt: null }
                });
                if (!assessment) {
                    throw new NotFoundError(`Assessment not found: ${item.assessmentId}`);
                }
                if (assessment.status !== "PUBLISHED") {
                    throw new BadRequestError(`Assessment is not published: ${item.assessmentId}`);
                }
                // Verify assessment belongs to the job's company
                if (assessment.companyId !== jobCompanyId) {
                    throw new ForbiddenError(`Assessment ${item.assessmentId} does not belong to the company owning this job`);
                }
                // Check if already assigned
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
                }
                else {
                    // Update the fields if already assigned (keeps it idempotent and updates config)
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
//# sourceMappingURL=jobAssessment.repository.js.map