import prisma from "../../../config/database.js";
import { ApplicationStatus } from "../../../common/enums/all_enums.js";

export class ApplicationRepository {

    static async getResume(resumeId: string) {
        return prisma.resume.findUnique({
            where: {
                id: resumeId
            }
        })
    }

    static async getJob(jobId: string) {
        return await prisma.job.findUnique({
            where: {
                id: jobId
            }
        })
    }

    static async getApplication(
        candidateId: string,
        jobId: string
    ) {
        return prisma.application.findUnique({
            where: {
                candidateId_jobId: {
                    candidateId,
                    jobId
                }
            }
        });
    }

    static async createApplication(
        data: {
            candidateId: string,
            jobId: string,
            resumeId: string,
            status: ApplicationStatus
        }
    ) {
        return prisma.application.create({
            data
        })
    }

    static async getCandidateApplications(params: {
        candidateId: string;
        page: number;
        limit: number;
        status?: string | undefined;
        search?: string | undefined;
    }) {
        const { candidateId, page, limit, status, search } = params;
        const skip = (page - 1) * limit;

        const where: any = {
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

    static async getCandidateApplicationDetails(candidateId: string, applicationId: string) {
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

    static async updateApplicationStatus(
        applicationId: string,
        status: ApplicationStatus,
        withdrawReason?: string,
    ): Promise<void> {
        await prisma.application.update({
            where: { id: applicationId },
            data: {
                status,
                ...(withdrawReason !== undefined ? { withdrawReason } : {})
            }
        });
    }

    static async getJobApplications(params: {
        jobId: string;
        page: number;
        limit: number;
        status?: string | undefined;
        search?: string | undefined;
    }) {
        const { jobId, page, limit, status, search } = params;
        const skip = (page - 1) * limit;

        const where: any = {
            jobId,
        };

        if (status) {
            if (status === ApplicationStatus.WITHDRAWN) {
                where.status = {
                    equals: "NONE",
                };
            } else {
                where.status = status;
            }
        } else {
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

    static async getJobApplicationDetails(applicationId: string) {
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