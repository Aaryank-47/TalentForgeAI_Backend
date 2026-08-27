import prisma from "../../../config/database.js";
import { ApplicationStatus } from "../../../common/enums/all_enums.js";

export class ApplicationRepository {

    static async getAppliationById(
        applicationId: string
    ){
        return prisma.application.findUnique({
            where: {
                id: applicationId
            },
            include: {
                job: {
                    include: {
                        company: true
                    }
                },
                candidate: {
                    include: {
                        user: true
                    }
                }
            }
        })
    }

    static async getApplicationsByIds(
        applicationIds: string[]
    ) {
        return prisma.application.findMany({
            where: {
                id: { in: applicationIds }
            },
            include: {
                job: {
                    select: {
                        id: true,
                        workflowId: true,
                        companyId: true,
                        title: true,
                        company: true,
                        workflow: {
                            include: {
                                stages: {
                                    include: {
                                        stageLibrary: true
                                    },
                                    orderBy: {
                                        order: "asc"
                                    }
                                }
                            }
                        }
                    }
                },
                applicationWorkflow: {
                    include: {
                        workflowStage: {
                            include: {
                                stageLibrary: true
                            }
                        }
                    }
                },
                candidate: {
                    include: {
                        user: true
                    }
                }
            }
        });
    }

    static async getJobApplicationByJobId(
        jobId : string
    ){
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
        })
    }

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
            candidateId: string;
            jobId: string;
            sourceResumeId: string;
            fileName: string;
            fileUrl: string;
            fileSize: number;
            status: ApplicationStatus;
        }
    ) {
        return prisma.$transaction(async (tx) => {
            const application = await tx.application.create({
                data: {
                    candidateId: data.candidateId,
                    jobId: data.jobId,
                    status: data.status,
                    applicationResume: {
                        create: {
                            sourceResumeId: data.sourceResumeId,
                            fileName: data.fileName,
                            fileUrl: data.fileUrl,
                            fileSize: data.fileSize,
                        }
                    }
                },
                include: {
                    applicationResume: true
                }
            });
            return application;
        });
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
                    applicationResume: true,
                    applicationWorkflow: {
                        include: {
                            workflowStage: {
                                include: {
                                    stageLibrary: true,
                                    workflow: {
                                        include: {
                                            stages: {
                                                include: {
                                                    stageLibrary: true,
                                                },
                                                orderBy: {
                                                    order: 'asc',
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            workflowHistories: {
                                include: {
                                    fromStage: {
                                        include: {
                                            stageLibrary: true,
                                        },
                                    },
                                    toStage: {
                                        include: {
                                            stageLibrary: true,
                                        },
                                    },
                                },
                                orderBy: {
                                    createdAt: 'asc',
                                },
                            },
                        },
                    },
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
                applicationResume: {
                    select: {
                        id: true,
                        fileName: true,
                        fileUrl: true,
                        fileSize: true,
                        sourceResumeId: true,
                    },
                },
                applicationWorkflow: {
                    include: {
                        workflowStage: {
                            include: {
                                stageLibrary: true,
                                workflow: {
                                    include: {
                                        stages: {
                                            include: {
                                                stageLibrary: true,
                                            },
                                            orderBy: {
                                                order: 'asc',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        workflowHistories: {
                            include: {
                                fromStage: {
                                    include: {
                                        stageLibrary: true,
                                    },
                                },
                                toStage: {
                                    include: {
                                        stageLibrary: true,
                                    },
                                },
                            },
                            orderBy: {
                                createdAt: 'asc',
                            },
                        },
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

    static async getCompanyApplications(params: {
        companyId: string;
        jobId?: string | undefined;
        status?: string | undefined;
        search?: string | undefined;
        page: number;
        limit: number;
    }) {
        const { companyId, jobId, status, search, page, limit } = params;
        const skip = (page - 1) * limit;

        const where: any = {
            job: {
                companyId,
                status: 'PUBLISHED'
            },
        };

        if (jobId) {
            where.jobId = jobId;
        }

        if (status) {
            const upperStatus = status.toUpperCase();
            if (['APPLIED', 'INREVIEW', 'WITHDRAWN', 'HIRED', 'REJECTED'].includes(upperStatus)) {
                where.status = upperStatus;
            } else {
                where.OR = [
                    {
                        applicationWorkflow: {
                            workflowStage: {
                                stageLibrary: {
                                    name: {
                                        contains: status,
                                        mode: 'insensitive',
                                    }
                                }
                            }
                        }
                    },
                    {
                        status: {
                            contains: status,
                            mode: 'insensitive',
                        }
                    }
                ];
            }
        }

        if (search) {
            where.candidate = {
                OR: [
                    {
                        fullName: {
                            contains: search,
                            mode: 'insensitive',
                        }
                    },
                    {
                        user: {
                            email: {
                                contains: search,
                                mode: 'insensitive',
                            },
                        },
                    }
                ]
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
                            location: true,
                            workplaceType: true,
                            employmentType: true,
                        }
                    },
                    candidate: {
                        include: {
                            user: {
                                select: {
                                    email: true,
                                    status: true,
                                }
                            },
                            skills: true,
                            experiences: true,
                            educations: true,
                        }
                    },
                    applicationWorkflow: {
                        include: {
                            workflowStage: {
                                include: {
                                    stageLibrary: true
                                }
                            }
                        }
                    },
                    applicationResume: true,
                    assessmentAttempts: {
                        orderBy: {
                            createdAt: 'desc'
                        },
                        take: 1
                    }
                },
            }),
            prisma.application.count({ where }),
        ]);

        return {
            applications,
            total,
        };
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
                    applicationResume: true,
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
                applicationResume: true,
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