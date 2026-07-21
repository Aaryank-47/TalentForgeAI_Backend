import { AuthRepository } from "../../auth/repositories/auth.repository.js"
import { NotFoundError } from "../../../common/errors/NotFoundError.js"
import type { CandidateProfileView, ResumeView } from "../interfaces/candidate.interface.js"
import { CandidateRepository } from "../repository/candidate.repository.js";
import type { UpdateCandidateProfileDto } from "../dto/candidate.dto.js"
import { calculateCandidateProfileCompletion } from "../utils/profileCompletion.util.js";
import type { Resume } from "@prisma/client";
import { ConflictError } from "../../../common/errors/ConflictError.js";


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

    // static async getResumes(
    //     resumeId: string,
    //     candidateId: string
    // ):Promise<Resume[]>{
    //     const allowedUser = await CandidateRepository.findResumeBelongToUser(candidateId, resumeId);
    //     if(!allowedUser){
    //         throw new ConflictError("Resume doesn't belong to this user");
    //     }

    //     const resume = await CandidateRepository.findResumeById(resumeId);
    //     if(!resume){
    //         throw new NotFoundError("Resume not found");
    //     }
        
    //     return resume
        
    // }
}