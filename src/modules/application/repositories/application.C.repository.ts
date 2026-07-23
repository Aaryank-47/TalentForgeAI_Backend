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
        data:{
            candidateId:string,
            jobId:string,
            resumeId:string,
            status:ApplicationStatus
        }
    ){
        return prisma.application.create({
            data
        })
    }

}