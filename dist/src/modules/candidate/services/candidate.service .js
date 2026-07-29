import { AuthRepository } from "../../auth/repositories/auth.repository.js";
import { NotFoundError } from "../../../common/errors/NotFoundError.js";
import { CandidateRepository } from "../repository/candidate.repository.js";
import { calculateCandidateProfileCompletion } from "../utils/profileCompletion.util.js";
import { ConflictError } from "../../../common/errors/ConflictError.js";
import { deleteFileFromCloudinary } from "../../../common/uploads/index.js";
import { extractPublicId } from "../../company/utils/company.utils.js";
import { CompanyRepository } from "../../company/repository/company.repository.js";
import { ForbiddenError } from "../../../common/errors/ForbiddenError.js";
import { removeUndefined } from "../../../common/helper/object.helper.js";
export class CandidateService {
    static async getCandidateProfile(candidateId) {
        const candidate = await AuthRepository.findProfileByUserId(candidateId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }
        return candidate.profile;
    }
    static async updateProfile(candidateId, updateData) {
        const candidate = await AuthRepository.findProfileByUserId(candidateId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }
        console.log("candidateid : ", candidateId);
        console.log("UpdatedData : ", updateData);
        const updateCandidateProfile = await CandidateRepository.updateCandidateProfile(candidateId, updateData);
        return updateCandidateProfile;
    }
    static async calculateProfileCompletion(candidateId) {
        const candidate = await CandidateRepository.findProfileWithRelationsCount(candidateId);
        if (!candidate) {
            throw new NotFoundError("Candidate profile not found");
        }
        return calculateCandidateProfileCompletion(candidate);
    }
    static async uploadResume(candidateId, resumeData) {
        const candidate = await AuthRepository.findProfileByUserId(candidateId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }
        const newResume = await CandidateRepository.uploadResume(candidateId, resumeData);
        return newResume;
    }
    static async getResumes(candidateId) {
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
    static async getResumeById(resumeId, candidateId) {
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
    static async deleteResumes(resumeIds, candidateId) {
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
    static async addSkills(candidateId, skills) {
        const candidate = await AuthRepository.findProfileByUserId(candidateId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }
        const candidateRecordId = candidate.profile.id;
        const addedSkills = [];
        for (const skillItem of skills) {
            const skill = await CandidateRepository.findSkillsNameViaCandidate(skillItem.skillName, candidateRecordId);
            if (skill) {
                throw new ConflictError(`Skill "${skillItem.skillName}" already exists`);
            }
            const newSkill = await CandidateRepository.addSkills(candidateRecordId, skillItem.skillName, skillItem.skillExperience ?? null);
            addedSkills.push(newSkill);
        }
        return addedSkills;
    }
    static async getAllSkills(candidateId) {
        const candidate = await AuthRepository.findProfileByUserId(candidateId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }
        const allSkills = await CandidateRepository.findAllSkillsByCandidateId(candidate.profile.id);
        return allSkills;
    }
    static async updateSkills(candidateId, skillId, skillName, skillExperience) {
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
        return updateSkill;
    }
    static async deleteSkills(candidateId, skillIds) {
        const candidate = await AuthRepository.findProfileByUserId(candidateId);
        if (!candidate ||
            !candidate.profile ||
            !("isOpenToWork" in candidate.profile)) {
            throw new NotFoundError("Candidate not found");
        }
        if (!skillIds || skillIds.length === 0) {
            throw new ConflictError("Please provide at least one skill id.");
        }
        const uniqueSkillIds = new Set(skillIds);
        if (uniqueSkillIds.size !== skillIds.length) {
            throw new ConflictError("Duplicate skill ids are not allowed.");
        }
        const candidateSkills = await CandidateRepository.findSkillsBelongToUser(candidate.profile.id, [...uniqueSkillIds]);
        // console.log("candidateId from delete skills : " + candidateId);
        // console.log("candidateRecordId from delete skills : " + candidate.profile.id);
        if (candidateSkills.length !== uniqueSkillIds.size) {
            throw new NotFoundError("One or more skills do not exist or do not belong to this candidate.");
        }
        const deletedCount = await CandidateRepository.deleteSkills([...uniqueSkillIds]);
        if (deletedCount !== uniqueSkillIds.size) {
            throw new ConflictError("Failed to delete one or more skills.");
        }
    }
    static async addEducation(candidateId, data) {
        const candidate = await AuthRepository.findProfileByUserId(candidateId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }
        const candidateRecordId = candidate.profile.id;
        const newEducation = await CandidateRepository.addEducation(candidateRecordId, data);
        return newEducation;
    }
    static async getEducations(candidateId) {
        const candidate = await AuthRepository.findProfileByUserId(candidateId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }
        const educations = await CandidateRepository.findAllEducations(candidate.profile.id);
        return educations;
    }
    static async getEducationById(educationId, candidateId) {
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
    static async updateEducation(candidateId, educationId, data) {
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
    static async deleteEducation(candidateId, educationId) {
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
    static async addExperience(candidateId, data) {
        const candidate = await AuthRepository.findProfileByUserId(candidateId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }
        const companyExists = await CompanyRepository.findCompanyByName(data.companyName);
        if (!companyExists) {
            throw new NotFoundError(`Company "${data.companyName}" not found`);
        }
        const candidateRecordId = candidate.profile.id;
        const newExperience = await CandidateRepository.addExperience(candidateRecordId, data);
        return newExperience;
    }
    static async getExperiences(candidateId) {
        const candidate = await AuthRepository.findProfileByUserId(candidateId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }
        const experiences = await CandidateRepository.findAllExperiences(candidate.profile.id);
        return experiences;
    }
    static async getExperienceById(experienceId, candidateId) {
        const candidate = await AuthRepository.findProfileByUserId(candidateId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }
        const experience = await CandidateRepository.findExperienceBelongToUser(candidateId, experienceId);
        if (!experience) {
            throw new NotFoundError('Experience record not found or does not belong to candidate');
        }
        return experience;
    }
    static async updateExperience(candidateId, experienceId, data) {
        const candidate = await AuthRepository.findProfileByUserId(candidateId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }
        const experience = await CandidateRepository.findExperienceBelongToUser(candidateId, experienceId);
        if (!experience) {
            throw new NotFoundError('Experience record not found or does not belong to candidate');
        }
        if (data.companyName) {
            const companyExists = await CompanyRepository.findCompanyByName(data.companyName);
            if (!companyExists) {
                throw new NotFoundError(`Company "${data.companyName}" not found`);
            }
        }
        const updatedExperience = await CandidateRepository.updateExperience(experienceId, data);
        return updatedExperience;
    }
    static async deleteExperience(candidateId, experienceId) {
        const candidate = await AuthRepository.findProfileByUserId(candidateId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }
        const experience = await CandidateRepository.findExperienceBelongToUser(candidateId, experienceId);
        if (!experience) {
            throw new NotFoundError('Experience record not found or does not belong to candidate');
        }
        const deletedExperience = await CandidateRepository.deleteExperience(experienceId);
        return deletedExperience;
    }
    static async getPublicProfile(candidateId) {
        const candidate = await CandidateRepository.findProfileByCandidateId(candidateId);
        if (!candidate) {
            throw new NotFoundError('Candidate not found');
        }
        return candidate;
    }
    static async getCandidateResumes(candidateId, loggedInUser) {
        const candidate = await CandidateRepository.findProfileByCandidateId(candidateId);
        if (!candidate) {
            throw new NotFoundError('Candidate not found');
        }
        const isSelf = candidate.userId === loggedInUser.id;
        const isRecruiterOrAdmin = ["EMPLOYER", "ADMIN", "SUPER_ADMIN"].includes(loggedInUser.role);
        if (!isSelf && !isRecruiterOrAdmin) {
            throw new ForbiddenError("You do not have permission to view this candidate's resumes");
        }
        const resumes = await CandidateRepository.findResumesByCandidateId(candidateId);
        return resumes;
    }
    static async toggleOpenToWork(userId, isOpenToWork) {
        const candidate = await AuthRepository.findProfileByUserId(userId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }
        return CandidateRepository.updateCandidateSettings(userId, {
            isOpenToWork
        });
    }
    static async updateSalaryPreferences(userId, data) {
        const candidate = await AuthRepository.findProfileByUserId(userId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }
        return CandidateRepository.updateCandidateSettings(userId, removeUndefined({
            expectedSalary: data.expectedSalary,
            currentSalary: data.currentSalary,
            noticePeriod: data.noticePeriod
        }));
    }
    static async updateLocationPreferences(userId, data) {
        const candidate = await AuthRepository.findProfileByUserId(userId);
        if (!candidate || !candidate.profile || !('isOpenToWork' in candidate.profile)) {
            throw new NotFoundError('Candidate not found');
        }
        return CandidateRepository.updateCandidateSettings(userId, removeUndefined({
            preferredLocation: data.preferredLocation,
            currentLocation: data.currentLocation
        }));
    }
}
//# sourceMappingURL=candidate.service%20.js.map