import { AuthRepository } from "../../auth/repositories/auth.repository.js"
import { NotFoundError } from "../../../common/errors/NotFoundError.js"
import type { CandidateProfileView, ResumeView, SkillsView, CandidateEducationView } from "../interfaces/candidate.interface.js"
import { CandidateRepository } from "../repository/candidate.repository.js";
import type { UpdateCandidateProfileDto, SingleSkillDto, AddEducationDto, UpdateEducationDto } from "../dto/candidate.dto.js"
import { calculateCandidateProfileCompletion } from "../utils/profileCompletion.util.js";
import type { Resume } from "@prisma/client";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { deleteFileFromCloudinary } from "../../../common/uploads/index.js";
import { extractPublicId } from "../../company/utils/company.utils.js";


export class CandidateService {
    static async getCandidateProfile(
        candidateId: string
    ): Promise<CandidateProfileView> {
        const candidate = await AuthRepository.findProfileByUserId(candidateId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }

        return candidate.profile;
    }

    static async updateProfile(
        candidateId: string,
        updateData: UpdateCandidateProfileDto
    ): Promise<CandidateProfileView> {
        const candidate = await AuthRepository.findProfileByUserId(candidateId);

        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }

        console.log("candidateid : ", candidateId);
        console.log("UpdatedData : ", updateData);

        const updateCandidateProfile = await CandidateRepository.updateCandidateProfile(candidateId, updateData);

        return updateCandidateProfile;
    }

    static async calculateProfileCompletion(
        candidateId: string
    ): Promise<number> {
        const candidate = await CandidateRepository.findProfileWithRelationsCount(candidateId);
        if (!candidate) {
            throw new NotFoundError("Candidate profile not found");
        }

        return calculateCandidateProfileCompletion(candidate);
    }

    static async uploadResume(
        candidateId: string,
        resumeData: { resumeUrl: string; resumeName: string; fileSize: number }
    ): Promise<Resume> {
        const candidate = await AuthRepository.findProfileByUserId(candidateId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }

        const newResume = await CandidateRepository.uploadResume(candidateId, resumeData);

        return newResume;
    }

    static async getResumes(
        candidateId: string
    ): Promise<ResumeView[]> {
        const candidate = await AuthRepository.findProfileByUserId(candidateId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }

        const resume = await CandidateRepository.findResumesByCandidateId(candidate.profile.id);
        if (!resume) {
            throw new NotFoundError("Resume not found");
        }

        return resume;
    }

    static async getResumeById(
        resumeId: string,
        candidateId: string
    ): Promise<Resume> {
        const candidate = await AuthRepository.findProfileByUserId(candidateId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }

        const allowedUser = await CandidateRepository.findResumeBelongToUser(candidateId, resumeId);
        if (!allowedUser || allowedUser.length === 0) {
            throw new ConflictError("Resume doesn't belong to this user");
        }

        const resumeList = await CandidateRepository.findResumeById(resumeId);
        const resume = resumeList[0];
        if (!resume) {
            throw new NotFoundError("Resume not found");
        }

        return resume;
    }

    static async deleteResumes(
        resumeIds: string[],
        candidateId: string
    ): Promise<void> {
        const candidate = await AuthRepository.findProfileByUserId(candidateId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }

        const allowedResumes = await CandidateRepository.findResumesBelongingToUser(candidateId, resumeIds);
        if (allowedResumes.length !== resumeIds.length) {
            throw new ConflictError("One or more resumes do not exist or do not belong to this user");
        }

        const deletePromises = allowedResumes.map(async (resume) => {
            const publicId = extractPublicId(resume.resumeUrl);
            if (publicId) {
                await deleteFileFromCloudinary({
                    publicId,
                    resourceType: 'raw'
                });
            }
        });
        await Promise.all(deletePromises);

        await CandidateRepository.deleteMultipleResumes(resumeIds);
    }

    static async addSkills(
        candidateId: string,
        skills: SingleSkillDto[]
    ): Promise<SkillsView[]> {
        const candidate = await AuthRepository.findProfileByUserId(candidateId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }

        const candidateRecordId = candidate.profile.id;
        const addedSkills: SkillsView[] = [];

        for (const skillItem of skills) {
            const skill = await CandidateRepository.findSkillsNameViaCandidate(skillItem.skillName, candidateRecordId);
            if (skill) {
                throw new ConflictError(`Skill "${skillItem.skillName}" already exists`);
            }

            const newSkill = await CandidateRepository.addSkills(
                candidateRecordId,
                skillItem.skillName,
                skillItem.skillExperience ?? null
            );
            addedSkills.push(newSkill);
        }

        return addedSkills;
    }

    static async getAllSkills(
        candidateId: string
    ): Promise<SkillsView[]> {
        const candidate = await AuthRepository.findProfileByUserId(candidateId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }

        const allSkills = await CandidateRepository.findAllSkillsByCandidateId(candidate.profile.id);
        return allSkills;
    }

    static async updateSkills(
        candidateId: string,
        skillId: string,
        skillName: string,
        skillExperience: number
    ): Promise<SkillsView> {
        const candidate = await AuthRepository.findProfileByUserId(candidateId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }

        const skillExistence = await CandidateRepository.findSkillById(skillId);
        if (!skillExistence) {
            throw new NotFoundError("Skill not found");
        }

        const skill = CandidateRepository.findSkillBelongToUser(candidateId, skillId);
        if (!skill) {
            throw new ConflictError("Skill doesn't belong to this user");
        }

        const updateSkill = await CandidateRepository.updateSkill(skillId, skillName, skillExperience);

        return updateSkill
    }

    static async deleteSkills(
        candidateId: string,
        skillIds: string[]
    ): Promise<void> {

        const candidate = await AuthRepository.findProfileByUserId(candidateId);

        if (
            !candidate ||
            !candidate.profile ||
            !("isOpenToWork" in candidate.profile)
        ) {
            throw new NotFoundError("Candidate not found");
        }

        if (!skillIds || skillIds.length === 0) {
            throw new ConflictError("Please provide at least one skill id.");
        }

        const uniqueSkillIds = new Set(skillIds);

        if (uniqueSkillIds.size !== skillIds.length) {
            throw new ConflictError(
                "Duplicate skill ids are not allowed."
            );
        }

        const candidateSkills =
            await CandidateRepository.findSkillsBelongToUser(
                candidate.profile.id,
                [...uniqueSkillIds]
            );

        // console.log("candidateId from delete skills : " + candidateId);
        // console.log("candidateRecordId from delete skills : " + candidate.profile.id);


        if (candidateSkills.length !== uniqueSkillIds.size) {
            throw new NotFoundError(
                "One or more skills do not exist or do not belong to this candidate."
            );
        }

        const deletedCount =
            await CandidateRepository.deleteSkills([...uniqueSkillIds]);

        if (deletedCount !== uniqueSkillIds.size) {
            throw new ConflictError(
                "Failed to delete one or more skills."
            );
        }
    }

    static async addEducation(
        candidateId: string,
        data: AddEducationDto
    ): Promise<CandidateEducationView> {
        const candidate = await AuthRepository.findProfileByUserId(candidateId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }

        const candidateRecordId = candidate.profile.id;
        const newEducation = await CandidateRepository.addEducation(candidateRecordId, data);
        return newEducation;
    }

    static async getEducations(
        candidateId: string
    ): Promise<CandidateEducationView[]> {
        const candidate = await AuthRepository.findProfileByUserId(candidateId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }

        const educations = await CandidateRepository.findAllEducations(candidate.profile.id);
        return educations;
    }

    static async getEducationById(
        educationId: string,
        candidateId: string
    ): Promise<CandidateEducationView> {
        const candidate = await AuthRepository.findProfileByUserId(candidateId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }

        const education = await CandidateRepository.findEducationBelongToUser(candidateId, educationId);
        if (!education) {
            throw new NotFoundError('Education record not found or does not belong to candidate');
        }

        return education;
    }

    static async updateEducation(
        candidateId: string,
        educationId: string,
        data: UpdateEducationDto
    ): Promise<CandidateEducationView> {
        const candidate = await AuthRepository.findProfileByUserId(candidateId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }

        const education = await CandidateRepository.findEducationBelongToUser(candidateId, educationId);
        if (!education) {
            throw new NotFoundError('Education record not found or does not belong to candidate');
        }

        const updatedEducation = await CandidateRepository.updateEducation(educationId, data);
        return updatedEducation;
    }

    static async deleteEducation(
        candidateId: string,
        educationId: string
    ): Promise<CandidateEducationView> {
        const candidate = await AuthRepository.findProfileByUserId(candidateId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }

        const education = await CandidateRepository.findEducationBelongToUser(candidateId, educationId);
        if (!education) {
            throw new NotFoundError('Education record not found or does not belong to candidate');
        }

        const deletedEducation = await CandidateRepository.deleteEducation(educationId);
        return deletedEducation;
    }
}