import prisma from "../../../config/database.js";
import { ApplicationStatus } from "../../../common/enums/all_enums.js";
export class ApplicationRepository {
    static async getAppliationById(applicationId) {
        return prisma.application.findUnique({
            where: {
                id: applicationId
            },
            include: {
                job: true
            }
        });
    }
    static async getApplicationsByIds(applicationIds) {
        return prisma.application.findMany({
            where: {
                id: { in: applicationIds }
            },
            include: {
                job: {
                    select: {
                        id: true,
                        workflowId: true,
                        companyId: true
                    }
                }
            }
        });
    }
    static async getJobApplicationByJobId(jobId) {
        return prisma.application.findMany({
            where: {
                jobId
            },
            include: {
                candidate: {
                    select: {
                        id: true,
                        fullName: true,
                        user: {
                            select: {
                                email: true
                            }
                        }
                    }
                },
                applicationWorkflow: true
            }
        });
    }
    static async getResume(resumeId) {
        return prisma.resume.findUnique({
            where: {
                id: resumeId
            }
        });
    }
    static async getJob(jobId) {
        return await prisma.job.findUnique({
            where: {
                id: jobId
            }
        });
    }
    static async getApplication(candidateId, jobId) {
        return prisma.application.findUnique({
            where: {
                candidateId_jobId: {
                    candidateId,
                    jobId
                }
            }
        });
    }
    static async createApplication(data) {
        return prisma.application.create({
            data
        });
    }
    static async getCandidateApplications(params) {
        const { candidateId, page, limit, status, search } = params;
        const skip = (page - 1) * limit;
        const where = {
            candidateId,
        };
        if (status) {
            where.status = status;
        }
        if (search) {
            where.job = {
                OR: [
                    {
                        title: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                    {
                        company: {
                            companyName: {
                                contains: search,
                                mode: 'insensitive',
                            },
                        },
                    },
                ],
            };
        }
        const [applications, total] = await Promise.all([
            prisma.application.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    appliedAt: 'desc',
                },
                include: {
                    job: {
                        select: {
                            id: true,
                            title: true,
                            employmentType: true,
                            workplaceType: true,
                            location: true,
                            minimumSalary: true,
                            maximumSalary: true,
                            salaryPeriod: true,
                            company: {
                                select: {
                                    id: true,
                                    companyName: true,
                                    logo: true,
                                },
                            },
                        },
                    },
                },
            }),
            prisma.application.count({ where }),
        ]);
        return {
            applications,
            total,
        };
    }
    static async getCandidateApplicationDetails(candidateId, applicationId) {
        return prisma.application.findFirst({
            where: {
                id: applicationId,
                candidateId,
            },
            include: {
                job: {
                    include: {
                        company: {
                            select: {
                                id: true,
                                companyName: true,
                                logo: true,
                                website: true,
                                description: true,
                            },
                        },
                    },
                },
                resume: {
                    select: {
                        id: true,
                        resumeName: true,
                        resumeUrl: true,
                    },
                },
            },
        });
    }
    static async updateApplicationStatus(applicationId, status, withdrawReason) {
        await prisma.application.update({
            where: { id: applicationId },
            data: {
                status,
                ...(withdrawReason !== undefined ? { withdrawReason } : {})
            }
        });
    }
    static async getJobApplications(params) {
        const { jobId, page, limit, status, search } = params;
        const skip = (page - 1) * limit;
        const where = {
            jobId,
        };
        if (status) {
            if (status === ApplicationStatus.WITHDRAWN) {
                where.status = {
                    equals: "NONE",
                };
            }
            else {
                where.status = status;
            }
        }
        else {
            where.status = {
                not: ApplicationStatus.WITHDRAWN,
            };
        }
        if (search) {
            where.candidate = {
                OR: [
                    {
                        fullName: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                    {
                        user: {
                            email: {
                                contains: search,
                                mode: 'insensitive',
                            },
                        },
                    },
                ],
            };
        }
        const [applications, total] = await Promise.all([
            prisma.application.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    appliedAt: 'desc',
                },
                include: {
                    candidate: {
                        include: {
                            user: {
                                select: {
                                    email: true,
                                    status: true,
                                }
                            }
                        }
                    },
                    resume: true,
                },
            }),
            prisma.application.count({ where }),
        ]);
        return {
            applications,
            total,
        };
    }
    static async getJobApplicationDetails(applicationId) {
        return prisma.application.findUnique({
            where: {
                id: applicationId,
            },
            include: {
                candidate: {
                    include: {
                        user: {
                            select: {
                                email: true,
                                status: true,
                            },
                        },
                        educations: true,
                        experiences: true,
                        skills: true,
                    },
                },
                resume: true,
                job: {
                    include: {
                        company: {
                            select: {
                                id: true,
                                companyName: true,
                                logo: true,
                            }
                        },
                    },
                },
            },
        });
    }
}
//# sourceMappingURL=application.repository.js.map