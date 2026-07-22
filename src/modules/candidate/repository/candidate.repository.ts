import { candidateProfileSelect, resume, skill } from "../../../common/prisma.select/candidate.select.js";
import type { CandidateProfileView, ResumeView, SkillsView } from "../interfaces/candidate.interface.js";
import type { UpdateCandidateProfileDto } from "../dto/candidate.dto.js";
import prisma from "../../../config/database.js";
import { toCandidateUpdateInput } from "../mappper/candidate.mapper.js";
import type { Resume, Prisma } from "@prisma/client";

export class CandidateRepository {
    static async updateCandidateProfile(
        userId: string,
        updateData: UpdateCandidateProfileDto
    ): Promise<CandidateProfileView> {
        return prisma.candidate.update({
            where: {
                userId: userId
            },
            data: toCandidateUpdateInput(updateData),
            select: candidateProfileSelect
        })
    }

    static async findProfileWithRelationsCount(userId: string) {
        return prisma.candidate.findUnique({
            where: { userId },
            select: {
                fullName: true,
                phoneNumber: true,
                profilePicture: true,
                headline: true,
                bio: true,
                currentLocation: true,
                isOpenToWork: true,
                _count: {
                    select: {
                        skills: true,
                        educations: true,
                        experiences: true
                    }
                }
            }
        });
    }

    static async uploadResume(
        userId: string,
        resumeData: { resumeUrl: string; resumeName: string; fileSize: number }
    ): Promise<Resume> {
        const candidate = await prisma.candidate.findUniqueOrThrow({
            where: { userId },
            select: { id: true }
        });

        return prisma.resume.create({
            data: {
                candidateId: candidate.id,
                resumeUrl: resumeData.resumeUrl,
                resumeName: resumeData.resumeName,
                fileSize: resumeData.fileSize
            }
        });
    }

    static async findResumesByCandidateId(
        candidateId:string
    ):Promise<ResumeView[]>{
        return prisma.resume.findMany({
            where:{
                candidateId:candidateId
            },
            select: resume
        })
    }

    static async findResumeById(
        resumeId:string
    ):Promise<Resume[]>{
        return prisma.resume.findMany({
            where:{
                id:resumeId
            }
        })
    }

    static async findResumeBelongToUser(
        userId:string,
        resumeId:string
    ):Promise<Resume[]>{
        return prisma.resume.findMany({
            where:{
                id:resumeId,
                candidate: {
                    userId: userId
                }
            }
        })
    }

    static async findResumesBelongingToUser(
        userId: string,
        resumeIds: string[]
    ): Promise<Resume[]> {
        return prisma.resume.findMany({
            where: {
                id: {
                    in: resumeIds
                },
                candidate: {
                    userId: userId
                }
            }
        });
    }

    static async deleteResume(
        resumeId: string
    ): Promise<Resume> {
        return prisma.resume.delete({
            where: {
                id: resumeId
            }
        });
    }

    static async deleteMultipleResumes(
        resumeIds: string[]
    ): Promise<Prisma.BatchPayload> {
        return prisma.resume.deleteMany({
            where: {
                id: {
                    in: resumeIds
                }
            }
        });
    }

    static async findSkillById(
        skillId:string
    ):Promise<SkillsView | null>{
        return prisma.candidateSkill.findFirst({
            where:{
                id:skillId
            },
            select: skill
        })
    }

    static async findSkillsNameViaCandidate(
        skillName: string,
        candidateId: string
    ): Promise<SkillsView | null> {
        return prisma.candidateSkill.findFirst({
            where: {
                name: skillName,
                candidateId: candidateId
            },
            select: skill
        });
    }

    static async addSkills(
        candidateId: string,
        name: string,
        yearsOfExperience: number | null
    ): Promise<SkillsView> {
        return prisma.candidateSkill.create({
            data: {
                candidateId,
                name,
                yearsOfExperience
            },
            select: skill
        });
    }

    static async findAllSkillsByCandidateId(
        candidateId: string
    ):Promise<SkillsView[]>{
        return prisma.candidateSkill.findMany({
            where:{
                candidateId:candidateId
            },
            select: skill
        })
    }

    static async findSkillBelongToUser(
        candidateId: string,
        skillId: string
    ):Promise<SkillsView | null>{
        return prisma.candidateSkill.findFirst({
            where:{
                id: skillId,
                candidateId: candidateId
            },
            select: {
                id: true,
                name: true,
                yearsOfExperience: true,
                candidateId: true
            }
        })
    }

    static async updateSkill(
        skillId:string,
        skillsName: string,
        yearsOfExperience: number
    ):Promise<SkillsView>{
        return prisma.candidateSkill.update({
            where: {
                id: skillId
            },
            data: {
                name: skillsName,
                yearsOfExperience
            },
            select: skill
        })
    }

    // static async deleteSkill(
    //     skillId: string
    // ):Promise<SkillsView>{}
}