import { AuthRepository } from "../../auth/repositories/auth.repository.js"
import { NotFoundError } from "../../../common/errors/NotFoundError.js"
import type { CandidateProfileView, ResumeView, SkillsView } from "../interfaces/candidate.interface.js"
import { CandidateRepository } from "../repository/candidate.repository.js";
import type { UpdateCandidateProfileDto, SingleSkillDto } from "../dto/candidate.dto.js"
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
    ):Promise<ResumeView[]>{
        const candidate = await AuthRepository.findProfileByUserId(candidateId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }

        const resume = await CandidateRepository.findResumesByCandidateId(candidate.profile.id);
        if(!resume){
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
    ):Promise<SkillsView[]>{
        const candidate = await AuthRepository.findProfileByUserId(candidateId);
        if(!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)){
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
    ):Promise<SkillsView>{
        const candidate = await AuthRepository.findProfileByUserId(candidateId);
        if(!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)){
            throw new NotFoundError('Candidate not found');
        }

        const skillExistence = await CandidateRepository.findSkillById(skillId);
        if(!skillExistence){
            throw new NotFoundError("Skill not found");
        }

    const skill = CandidateRepository.findSkillBelongToUser(candidateId, skillId);
        if(!skill){
            throw new ConflictError("Skill doesn't belong to this user");
        }

        const updateSkill = await CandidateRepository.updateSkill(skillId,skillName ,skillExperience);
        
        return updateSkill
    }
}