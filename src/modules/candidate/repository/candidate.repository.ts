import { candidateProfileSelect } from "../../../common/prisma.select/candidate.select.js";
import type { CandidateProfileView } from "../interfaces/candidate.interface.js";
import type { UpdateCandidateProfileDto } from "../dto/candidate.dto.js";
import prisma from "../../../config/database.js";
import { toCandidateUpdateInput } from "../mappper/candidate.mapper.js";
import type { Resume } from "@prisma/client";

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
}