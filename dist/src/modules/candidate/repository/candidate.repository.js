import { candidateProfileSelect, resume, skill, education, experience } from "../../../common/prisma.select/candidate.select.js";
import prisma from "../../../config/database.js";
import { toCandidateUpdateInput } from "../mappper/candidate.mapper.js";
import { removeUndefined } from "../../../common/helper/object.helper.js";
export class CandidateRepository {
    static async updateCandidateProfile(userId, updateData) {
        return prisma.candidate.update({
            where: {
                userId: userId
            },
            data: toCandidateUpdateInput(updateData),
            select: candidateProfileSelect
        });
    }
    static async findProfileWithRelationsCount(userId) {
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
    static async uploadResume(userId, resumeData) {
        const candidate = await prisma.candidate.findUniqueOrThrow({
            where: { userId },
            select: { id: true }
        });
        return prisma.resume.create({
            data: {
                candidateId: candidate.id,
                resumeUrl: resumeData.resumeUrl,
                resumeName: resumeData.resumeName,
                fileSize: resumeData.fileSize,
                parsingStatus: "QUEUED"
            }
        });
    }
    static async resetResumeForRetry(resumeId) {
        return prisma.resume.update({
            where: { id: resumeId },
            data: {
                parsingStatus: "QUEUED",
                parsingError: null,
                parsingStartedAt: null,
                parsingCompletedAt: null
            }
        });
    }
    static async findResumesByCandidateId(candidateId) {
        return prisma.resume.findMany({
            where: {
                candidateId: candidateId
            },
            select: resume
        });
    }
    static async findResumeById(resumeId) {
        return prisma.resume.findMany({
            where: {
                id: resumeId
            }
        });
    }
    static async findResumeBelongToUser(userId, resumeId) {
        return prisma.resume.findMany({
            where: {
                id: resumeId,
                candidate: {
                    userId: userId
                }
            }
        });
    }
    static async findResumesBelongingToUser(userId, resumeIds) {
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
    static async deleteResume(resumeId) {
        return prisma.resume.delete({
            where: {
                id: resumeId
            }
        });
    }
    static async deleteMultipleResumes(resumeIds) {
        return prisma.resume.deleteMany({
            where: {
                id: {
                    in: resumeIds
                }
            }
        });
    }
    static async findSkillById(skillId) {
        return prisma.candidateSkill.findFirst({
            where: {
                id: skillId
            },
            select: skill
        });
    }
    static async findSkillsNameViaCandidate(skillName, candidateId) {
        return prisma.candidateSkill.findFirst({
            where: {
                name: skillName,
                candidateId: candidateId
            },
            select: skill
        });
    }
    static async addSkills(candidateId, name, yearsOfExperience) {
        return prisma.candidateSkill.create({
            data: {
                candidateId,
                name,
                yearsOfExperience
            },
            select: skill
        });
    }
    static async findAllSkillsByCandidateId(candidateId) {
        return prisma.candidateSkill.findMany({
            where: {
                candidateId: candidateId
            },
            select: skill
        });
    }
    static async findSkillBelongToUser(candidateId, skillId) {
        return prisma.candidateSkill.findFirst({
            where: {
                id: skillId,
                candidateId: candidateId
            },
            select: {
                id: true,
                name: true,
                yearsOfExperience: true,
                candidateId: true
            }
        });
    }
    static async findSkillsBelongToUser(candidateId, skillIds) {
        return prisma.candidateSkill.findMany({
            where: {
                candidateId,
                id: {
                    in: skillIds
                }
            },
            select: {
                id: true
            }
        });
    }
    static async updateSkill(skillId, skillsName, yearsOfExperience) {
        return prisma.candidateSkill.update({
            where: {
                id: skillId
            },
            data: {
                name: skillsName,
                yearsOfExperience
            },
            select: skill
        });
    }
    static async deleteSkills(skillIds) {
        const result = await prisma.candidateSkill.deleteMany({
            where: {
                id: {
                    in: skillIds
                }
            }
        });
        return result.count;
    }
    static async addEducation(candidateId, data) {
        return prisma.candidateEducation.create({
            data: removeUndefined({
                candidateId,
                ...data
            }),
            select: education
        });
    }
    static async findAllEducations(candidateId) {
        return prisma.candidateEducation.findMany({
            where: {
                candidateId
            },
            select: education
        });
    }
    static async findEducationById(educationId) {
        return prisma.candidateEducation.findFirst({
            where: {
                id: educationId
            },
            select: education
        });
    }
    static async findEducationBelongToUser(userId, educationId) {
        return prisma.candidateEducation.findFirst({
            where: {
                id: educationId,
                candidate: {
                    userId: userId
                }
            },
            select: education
        });
    }
    static async updateEducation(educationId, data) {
        return prisma.candidateEducation.update({
            where: {
                id: educationId
            },
            data: removeUndefined(data),
            select: education
        });
    }
    static async deleteEducation(educationId) {
        return prisma.candidateEducation.delete({
            where: {
                id: educationId
            },
            select: education
        });
    }
    static async addExperience(candidateId, data) {
        return prisma.candidateExperience.create({
            data: removeUndefined({
                candidateId,
                ...data
            }),
            select: experience
        });
    }
    static async findAllExperiences(candidateId) {
        return prisma.candidateExperience.findMany({
            where: {
                candidateId
            },
            select: experience
        });
    }
    static async findExperienceById(experienceId) {
        return prisma.candidateExperience.findFirst({
            where: {
                id: experienceId
            },
            select: experience
        });
    }
    static async findExperienceBelongToUser(userId, experienceId) {
        return prisma.candidateExperience.findFirst({
            where: {
                id: experienceId,
                candidate: {
                    userId: userId
                }
            },
            select: experience
        });
    }
    static async updateExperience(experienceId, data) {
        return prisma.candidateExperience.update({
            where: {
                id: experienceId
            },
            data: removeUndefined(data),
            select: experience
        });
    }
    static async deleteExperience(experienceId) {
        return prisma.candidateExperience.delete({
            where: {
                id: experienceId
            },
            select: experience
        });
    }
    static async findProfileByCandidateId(candidateId) {
        return prisma.candidate.findUnique({
            where: { id: candidateId },
            include: {
                skills: true,
                educations: true,
                experiences: true,
            }
        });
    }
    static async createCandidateProfile(userId, data) {
        return prisma.candidate.create({
            data: {
                userId,
                fullName: data.fullName,
                phoneNumber: data.phoneNumber ?? null,
                headline: data.headline ?? null,
            },
            select: candidateProfileSelect,
        });
    }
    static async updateCandidateSettings(userId, data) {
        return prisma.candidate.update({
            where: { userId },
            data,
            select: candidateProfileSelect
        });
    }
}
//# sourceMappingURL=candidate.repository.js.map